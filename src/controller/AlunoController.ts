// Importa a classe Aluno do model — é daqui que vêm os métodos de acesso ao banco de dados
import Aluno from "../model/Aluno.js";
// Importa os tipos Request e Response do Express — representam a requisição e a resposta HTTP
// "type" indica que é uma importação apenas de tipo (só existe em tempo de compilação, não gera código JS)
import { type Request, type Response } from "express";
// Importa o tipo AlunoDTO para tipar os dados recebidos do front-end
import type AlunoDTO from "../dto/AlunoDTO.js";

// Define a classe AlunoController que HERDA da classe Aluno
// Isso permite que o controller acesse diretamente os métodos estáticos do model (listarAlunos, cadastrarAluno, etc.)
// A arquitetura MVC separa responsabilidades: o Model cuida do banco, o Controller cuida das requisições HTTP
class AlunoController extends Aluno {

    /**
     * Lista todos os alunos ativos.
     * @param req Objeto de requisição HTTP
     * @param res Objeto de resposta HTTP — retorna lista de alunos ou mensagem de erro
     */
    static async todos(req: Request, res: Response): Promise<void> {
        try {
            // Chama o método do model para buscar todos os alunos ativos no banco
            const listaDeAlunos = await Aluno.listarAlunos();

            // Se não houver alunos, retorna 404 (Not Found — recurso não encontrado)
            if (!listaDeAlunos) {
                res.status(404).json({ mensagem: "Nenhum aluno encontrado." });
                return;
            }

            // Retorna a lista em formato JSON com status 200 (OK — requisição bem-sucedida)
            res.status(200).json(listaDeAlunos);

        } catch (error) {
            // Verifica se o erro é uma instância de Error para acessar a mensagem com segurança
            console.error(`Erro ao listar alunos: ${error}`);

            // Status 500 — Internal Server Error — erro inesperado no servidor
            res.status(500).json({ mensagem: "Erro interno ao recuperar a lista de alunos." });
        }
    }

    /**
     * Retorna informações de um aluno
     * @param req Objeto de requisição HTTP
     * @param res Objeto de resposta HTTP.
     * @returns Informações de aluno em formato JSON.
     */
    // Método que busca um único aluno com base no ID informado na URL (ex: GET /aluno/5)
    /**
 * Busca um aluno específico pelo ID informado na URL.
 * @param req Objeto de requisição HTTP — espera o parâmetro "id" na URL (ex: /alunos/1)
 * @param res Objeto de resposta HTTP — retorna o aluno encontrado ou mensagem de erro
 */
static async aluno(req: Request, res: Response): Promise<void> {
    try {
        // Lê o parâmetro "id" da URL e converte de string para número inteiro
        // Exemplo de URL: GET /alunos/5 → req.params.id = "5" → idAluno = 5
        const idAluno = parseInt(req.params.id as string);

        // Valida se o ID é um número válido — parseInt retorna NaN para valores inválidos
        // Isso evita que uma requisição com ID inválido chegue até o banco de dados
        if (isNaN(idAluno)) {
            res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro." });
            return;
        }

        // Chama o método do model para buscar o aluno pelo ID no banco
        const aluno = await Aluno.listarAluno(idAluno);

        // Se o model retornar null, o aluno não existe ou está inativo no banco
        if (!aluno) {
            res.status(404).json({ mensagem: "Aluno não encontrado." });
            return;
        }

        // Retorna o objeto do aluno em JSON com status 200 (OK — requisição bem-sucedida)
        res.status(200).json(aluno);

    } catch (error) {
        // Exibe o erro no stream de erro do servidor para facilitar o debug
        console.error(`Erro ao buscar aluno: ${error}`);

        // Status 500 — Internal Server Error — erro inesperado no servidor
        res.status(500).json({ mensagem: "Erro interno ao recuperar as informações do aluno." });
    }
}
    /**
      * Cadastra um novo aluno.
      * @param req Objeto de requisição HTTP com os dados do aluno.
      * @param res Objeto de resposta HTTP.
      * @returns Mensagem de sucesso ou erro em formato JSON.
      */
    // Método que recebe os dados do front-end e cria um novo aluno no banco de dados
    /**
 * Cadastra um novo aluno no banco de dados.
 * @param req Objeto de requisição HTTP — espera os dados do aluno no corpo (body)
 * @param res Objeto de resposta HTTP — retorna mensagem de sucesso ou erro
 */
static async cadastrar(req: Request, res: Response): Promise<void> {
    try {
        // Lê o corpo da requisição e tipifica como AlunoDTO
        // O front-end envia os dados em formato JSON no corpo da requisição (POST)
        const dadosRecebidos: AlunoDTO = req.body;

        // Valida se os campos obrigatórios foram enviados antes de tentar cadastrar
        // Sem essa verificação, o banco receberia dados inválidos e retornaria um erro genérico
        if (!dadosRecebidos.nome || !dadosRecebidos.sobrenome || !dadosRecebidos.celular) {
            res.status(400).json({ mensagem: "Campos obrigatórios ausentes: nome, sobrenome e celular." });
            return;
        }

        // Cria um novo objeto Aluno com os dados recebidos
        // O operador ?? define valores padrão para campos opcionais não enviados pelo front-end
        const novoAluno = new Aluno(
            dadosRecebidos.nome,
            dadosRecebidos.sobrenome,
            dadosRecebidos.data_nascimento ?? new Date("1900-01-01"), // Padrão se não informado
            dadosRecebidos.endereco        ?? '',                     // Padrão se não informado
            dadosRecebidos.email           ?? '',                     // Padrão se não informado
            dadosRecebidos.celular
        );

        // Chama o método do model para salvar o novo aluno no banco de dados
        const result = await Aluno.cadastrarAluno(novoAluno);

        // true = INSERT bem-sucedido; false = nenhuma linha foi inserida
        if (result) {
            // Status 201 — Created — recurso criado com sucesso
            res.status(201).json({ mensagem: "Aluno cadastrado com sucesso." });
        } else {
            // Status 400 — Bad Request — os dados enviados não permitiram o cadastro
            res.status(400).json({ mensagem: "Não foi possível cadastrar o aluno." });
        }

    } catch (error) {
        // Exibe o erro no stream de erro do servidor para facilitar o debug
        console.error(`Erro ao cadastrar aluno: ${error}`);

        // Status 500 — Internal Server Error — erro inesperado no servidor
        res.status(500).json({ mensagem: "Erro interno ao cadastrar o aluno." });
    }
}
    /**
     * Remove um aluno.
     * @param req Objeto de requisição HTTP com o ID do aluno a ser removido.
     * @param res Objeto de resposta HTTP.
     * @returns Mensagem de sucesso ou erro em formato JSON.
     */
    // Método que recebe um ID pela URL e realiza a remoção lógica do aluno no banco
    // "Promise<Response>" indica que este método sempre retorna uma resposta HTTP ao final
    /**
 * Remove logicamente um aluno pelo ID informado na URL.
 * @param req Objeto de requisição HTTP — espera o parâmetro "id" na URL (ex: /alunos/1)
 * @param res Objeto de resposta HTTP — retorna mensagem de sucesso ou erro
 */
static async remover(req: Request, res: Response): Promise<void> {
    try {
        // Lê o parâmetro "id" da URL e converte de string para número inteiro
        // Exemplo de URL: DELETE /alunos/3 → req.params.id = "3" → idAluno = 3
        const idAluno = parseInt(req.params.id as string);

        // Valida se o ID é um número válido — parseInt retorna NaN para valores inválidos
        // Isso evita que uma requisição com ID inválido chegue até o banco de dados
        if (isNaN(idAluno)) {
            res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro." });
            return;
        }

        // Chama o método do model para remover logicamente o aluno no banco
        // Remoção lógica = o aluno não é apagado, apenas marcado como inativo (status = false)
        const result = await Aluno.removerAluno(idAluno);

        // true = UPDATE bem-sucedido; false = aluno não encontrado ou já estava inativo
        if (result) {
            // Status 200 — OK — operação realizada com sucesso
            // (201 é reservado para criação de recursos — não se aplica aqui)
            res.status(200).json({ mensagem: "Aluno removido com sucesso." });
        } else {
            // Status 404 — Not Found — aluno não existe ou já estava inativo
            res.status(404).json({ mensagem: "Aluno não encontrado para exclusão." });
        }

    } catch (error) {
        // Exibe o erro no stream de erro do servidor para facilitar o debug
        console.error(`Erro ao remover aluno: ${error}`);

        // Status 500 — Internal Server Error — erro inesperado no servidor
        res.status(500).json({ mensagem: "Erro interno ao remover o aluno." });
    }
}
    /**
     * Método para atualizar o cadastro de um aluno.
     * 
     * @param req Objeto de requisição do Express, contendo os dados atualizados do aluno
     * @param res Objeto de resposta do Express
     * @returns Retorna uma resposta HTTP indicando sucesso ou falha na atualização
     */
    // Método que recebe os novos dados do front-end e atualiza o cadastro do aluno no banco
    /**
 * Atualiza os dados de um aluno existente pelo ID informado na URL.
 * @param req Objeto de requisição HTTP — espera o "id" na URL e os dados atualizados no body
 * @param res Objeto de resposta HTTP — retorna mensagem de sucesso ou erro
 */
static async atualizar(req: Request, res: Response): Promise<void> {
    try {
        // Lê o parâmetro "id" da URL e converte de string para número inteiro
        // Exemplo de URL: PUT /alunos/7 → req.params.id = "7" → idAluno = 7
        const idAluno = parseInt(req.params.id as string);

        // Valida se o ID é um número válido — parseInt retorna NaN para valores inválidos
        // Isso evita que uma requisição com ID inválido chegue até o banco de dados
        if (isNaN(idAluno)) {
            res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro." });
            return;
        }

        // Lê o corpo da requisição e tipifica como AlunoDTO
        // O front-end envia os dados atualizados em formato JSON no corpo da requisição (PUT)
        const dadosRecebidos: AlunoDTO = req.body;

        // Valida se os campos obrigatórios foram enviados antes de tentar atualizar
        if (!dadosRecebidos.nome || !dadosRecebidos.sobrenome || !dadosRecebidos.celular) {
            res.status(400).json({ mensagem: "Campos obrigatórios ausentes: nome, sobrenome e celular." });
            return;
        }

        // Cria um novo objeto Aluno com os dados recebidos do front-end
        // O operador ?? define valores padrão para campos opcionais não enviados
        const aluno = new Aluno(
            dadosRecebidos.nome,
            dadosRecebidos.sobrenome,
            dadosRecebidos.data_nascimento ?? new Date("1900-01-01"), // Padrão se não informado
            dadosRecebidos.endereco        ?? '',                     // Padrão se não informado
            dadosRecebidos.email           ?? '',                     // Padrão se não informado
            dadosRecebidos.celular
        );

        // Define o ID no objeto para que o model saiba qual aluno atualizar no banco
        aluno.setIdAluno(idAluno);

        // Chama o método do model para atualizar os dados no banco de dados
        const result = await Aluno.atualizarAluno(aluno);

        // true = UPDATE bem-sucedido; false = aluno não encontrado ou inativo
        if (result) {
            // Status 200 — OK — atualização realizada com sucesso
            res.status(200).json({ mensagem: "Cadastro atualizado com sucesso." });
        } else {
            // Status 404 — Not Found — aluno não existe ou está inativo no banco
            res.status(404).json({ mensagem: "Aluno não encontrado para atualização." });
        }

    } catch (error) {
        // Exibe o erro no stream de erro do servidor para facilitar o debug
        console.error(`Erro ao atualizar aluno: ${error}`);

        // Status 500 — Internal Server Error — erro inesperado no servidor
        res.status(500).json({ mensagem: "Erro interno ao atualizar o aluno." });
    }
}
}

// Exporta a classe para que possa ser importada nas rotas da aplicação
export default AlunoController;