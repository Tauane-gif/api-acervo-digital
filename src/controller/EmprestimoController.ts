// Importa a classe Emprestimo do model — é daqui que vêm os métodos de acesso ao banco de dados
import Emprestimo from "../model/Emprestimo.js";
// Importa os tipos Request e Response do Express — representam a requisição e a resposta HTTP
import { type Request, type Response } from "express";
// Importa o tipo EmprestimoDTO para tipar os dados recebidos do front-end
import type EmprestimoDTO from "../dto/EmprestimoDTO.js";

// Define a classe EmprestimoController que HERDA da classe Emprestimo
// A herança permite acessar os métodos estáticos do model diretamente
// O controller é responsável por receber as requisições HTTP e devolver as respostas — nunca acessa o banco diretamente
class EmprestimoController extends Emprestimo {

    /**
     * Lista todos os empréstimos ativos com dados de aluno e livro.
     * @param req Objeto de requisição HTTP
     * @param res Objeto de resposta HTTP — retorna lista de empréstimos ou mensagem de erro
     */
    static async todos(req: Request, res: Response): Promise<void> {
        try {
            // Chama o método do model para buscar todos os empréstimos ativos no banco
            // O resultado já vem com os dados de aluno e livro embutidos (graças ao JOIN da query)
            const listaDeEmprestimos = await Emprestimo.listarEmprestimos();

            // Se não houver empréstimos, retorna 404 (Not Found — recurso não encontrado)
            if (!listaDeEmprestimos) {
                res.status(404).json({ mensagem: "Nenhum empréstimo encontrado." });
                return;
            }

            // Retorna a lista em formato JSON com status 200 (OK — requisição bem-sucedida)
            res.status(200).json(listaDeEmprestimos);

        } catch (error) {
            // Exibe o erro no stream de erro do servidor para facilitar o debug
            console.error(`Erro ao listar empréstimos: ${error}`);

            // Status 500 — Internal Server Error — erro inesperado no servidor
            res.status(500).json({ mensagem: "Erro interno ao listar os empréstimos." });
        }
    }

    /**
     * Retorna informações de um empréstimo
     * @param req Objeto de requisição HTTP
     * @param res Objeto de resposta HTTP.
     * @returns Informações de empréstimo em formato JSON.
     */
    // Método que busca um único empréstimo com base no ID informado na URL (ex: GET /emprestimo/5)
    /**
 * Busca um empréstimo específico pelo ID informado na URL.
 * @param req Objeto de requisição HTTP — espera o parâmetro "id" na URL (ex: /emprestimos/1)
 * @param res Objeto de resposta HTTP — retorna o empréstimo encontrado ou mensagem de erro
 */
static async emprestimo(req: Request, res: Response): Promise<void> {
    try {
        // Lê o parâmetro "id" da URL e converte de string para número inteiro
        // Exemplo de URL: GET /emprestimos/5 → req.params.id = "5" → idEmprestimo = 5
        const idEmprestimo = parseInt(req.params.id as string);

        // Valida se o ID é um número válido — parseInt retorna NaN para valores inválidos
        // Isso evita que uma requisição com ID inválido chegue até o banco de dados
        if (isNaN(idEmprestimo)) {
            res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro." });
            return;
        }

        // Chama o método do model para buscar o empréstimo pelo ID no banco
        const emprestimo = await Emprestimo.listarEmprestimo(idEmprestimo);

        // Se o model retornar null, o empréstimo não existe ou está inativo no banco
        if (!emprestimo) {
            res.status(404).json({ mensagem: "Empréstimo não encontrado." });
            return;
        }

        // Retorna o objeto do empréstimo em JSON com status 200 (OK — requisição bem-sucedida)
        res.status(200).json(emprestimo);

    } catch (error) {
        // Exibe o erro no stream de erro do servidor para facilitar o debug
        console.error(`Erro ao buscar empréstimo: ${error}`);

        // Status 500 — Internal Server Error — erro inesperado no servidor
        res.status(500).json({ mensagem: "Erro interno ao recuperar as informações do empréstimo." });
    }
}
    /**
     * Cadastra um novo empréstimo.
     * Recebe os dados do empréstimo a partir da requisição e passa para o serviço.
     */
    // Método que recebe os dados do front-end e cria um novo empréstimo no banco de dados
    /**
 * Cadastra um novo empréstimo no banco de dados.
 * @param req Objeto de requisição HTTP — espera os dados do empréstimo no corpo (body)
 * @param res Objeto de resposta HTTP — retorna mensagem de sucesso ou erro
 */
static async cadastrar(req: Request, res: Response): Promise<void> {
    try {
        // Lê o corpo da requisição e tipifica como EmprestimoDTO
        // O front-end envia os dados em formato JSON no corpo da requisição (POST)
        const dadosRecebidos: EmprestimoDTO = req.body;

        // Valida se os campos obrigatórios foram enviados antes de tentar cadastrar
        // Sem essa verificação, o banco receberia dados inválidos e retornaria um erro genérico
        if (!dadosRecebidos.aluno?.id_aluno || !dadosRecebidos.livro?.id_livro || !dadosRecebidos.data_emprestimo) {
            res.status(400).json({ mensagem: "Campos obrigatórios ausentes: id_aluno, id_livro e data_emprestimo." });
            return;
        }

        // Cria um novo objeto Emprestimo com os dados recebidos do front-end
        // Os IDs vêm dos objetos aninhados "aluno" e "livro" dentro do EmprestimoDTO
        const emprestimo = new Emprestimo(
            dadosRecebidos.aluno.id_aluno,
            dadosRecebidos.livro.id_livro,
            new Date(dadosRecebidos.data_emprestimo),          // Converte string para objeto Date
            dadosRecebidos.status_emprestimo ?? "",             // Padrão vazio se não informado
            dadosRecebidos.data_devolucao
                ? new Date(dadosRecebidos.data_devolucao)       // Converte string para Date se informado
                : undefined                                     // Se não informado, o model calcula automaticamente
        );

        // Chama o método do model para salvar o novo empréstimo no banco de dados
        const result = await Emprestimo.cadastrarEmprestimo(emprestimo);

        // true = INSERT bem-sucedido; false = nenhuma linha foi inserida
        if (result) {
            // Status 201 — Created — recurso criado com sucesso
            res.status(201).json({ mensagem: "Empréstimo cadastrado com sucesso." });
        } else {
            // Status 400 — Bad Request — os dados enviados não permitiram o cadastro
            res.status(400).json({ mensagem: "Não foi possível cadastrar o empréstimo." });
        }

    } catch (error) {
        // Exibe o erro no stream de erro do servidor para facilitar o debug
        console.error(`Erro ao cadastrar empréstimo: ${error}`);

        // Status 500 — Internal Server Error — erro inesperado no servidor
        res.status(500).json({ mensagem: "Erro interno ao cadastrar o empréstimo." });
    }
}

    /**
     * Atualiza um empréstimo existente.
     * Recebe os dados do empréstimo a partir da requisição e passa para o serviço.
     */
    // Método que recebe os novos dados do front-end e atualiza o empréstimo no banco
    static async atualizar(req: Request, res: Response): Promise<Response> {
        try {
            // Lê o corpo da requisição e tipifica como EmprestimoDTO
            const dadosRecebidos: EmprestimoDTO = req.body;
            // Lê o parâmetro "id" da URL e converte para número inteiro
            // Exemplo de URL: PUT /emprestimo/4  →  idEmprestimo = 4
            const idEmprestimo = parseInt(req.params.id as string);

            // Chama o método do model passando cada campo individualmente como parâmetro
            // Diferente do cadastrar, o atualizarEmprestimo recebe os dados separados (não um objeto Emprestimo)
            const result = await Emprestimo.atualizarEmprestimo(
                idEmprestimo,                              // ID do empréstimo a ser atualizado (usado no WHERE da query)
                dadosRecebidos.aluno.id_aluno,             // Novo ID do aluno
                dadosRecebidos.livro.id_livro,             // Novo ID do livro
                new Date(dadosRecebidos.data_emprestimo),  // Nova data de empréstimo convertida para Date
                // Se data_devolucao foi informada, converte para Date; senão usa a data atual como fallback
                // ⚠️ Diferença do cadastrar: aqui usa new Date() (data atual) ao invés de undefined
                dadosRecebidos.data_devolucao ? new Date(dadosRecebidos.data_devolucao) : new Date(),
                dadosRecebidos.status_emprestimo ?? ""     // Novo status — usa string vazia se não informado
            );

            // Verifica o retorno do model: true = atualização bem-sucedida, false = falha
            if (result) {
                // Retorna mensagem de sucesso com status HTTP 200 (OK)
                return res.status(200).json({ mensagem: 'Empréstimo atualizado com sucesso.' });
            } else {
                // Retorna mensagem de erro com status HTTP 500
                // ⚠️ Observação: a mensagem diz "cadastrar o livro" mas deveria dizer "atualizar o empréstimo"
                return res.status(500).json({ mensagem: 'Não foi possível cadastrar o livro no banco de dados.' });
            }
        } catch (error) {
            // Exibe o erro no console e retorna status HTTP 500 em caso de exceção
            console.error('Erro ao atualizar empréstimo:', error);
            return res.status(500).json({ mensagem: 'Erro ao atualizar o empréstimo.' });
        }
    }

    /**
    * Método para remover um empréstimo do banco de dados
    * 
    * @param req Objeto de requisição HTTP com o ID do empréstimo a ser removido.
    * @param res Objeto de resposta HTTP.
    * @returns Mensagem de sucesso ou erro em formato JSON.
    */
    // Método que recebe um ID pela URL e realiza a remoção lógica do empréstimo no banco
    /**
 * Remove logicamente um empréstimo pelo ID informado na URL.
 * @param req Objeto de requisição HTTP — espera o parâmetro "id" na URL (ex: /emprestimos/2)
 * @param res Objeto de resposta HTTP — retorna mensagem de sucesso ou erro
 */
static async remover(req: Request, res: Response): Promise<void> {
    try {
        // Lê o parâmetro "id" da URL e converte de string para número inteiro
        // Exemplo de URL: DELETE /emprestimos/2 → req.params.id = "2" → idEmprestimo = 2
        const idEmprestimo = parseInt(req.params.id as string);

        // Valida se o ID é um número válido — parseInt retorna NaN para valores inválidos
        // Isso evita que uma requisição com ID inválido chegue até o banco de dados
        if (isNaN(idEmprestimo)) {
            res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro." });
            return;
        }

        // Chama o método do model para remover logicamente o empréstimo no banco
        // Remoção lógica = o registro não é apagado, apenas marcado como inativo (status = false)
        const resultado = await Emprestimo.removerEmprestimo(idEmprestimo);

        // true = UPDATE bem-sucedido; false = empréstimo não encontrado ou já inativo
        if (resultado) {
            // Status 200 — OK — operação realizada com sucesso
            res.status(200).json({ mensagem: "Empréstimo removido com sucesso." });
        } else {
            // Status 404 — Not Found — empréstimo não existe ou já estava inativo
            res.status(404).json({ mensagem: "Empréstimo não encontrado para exclusão." });
        }

    } catch (error) {
        // Exibe o erro no stream de erro do servidor para facilitar o debug
        console.error(`Erro ao remover empréstimo: ${error}`);

        // Status 500 — Internal Server Error — erro inesperado no servidor
        res.status(500).json({ mensagem: "Erro interno ao remover o empréstimo." });
    }
}
}

// Exporta a classe para que possa ser importada nas rotas da aplicação
export default EmprestimoController;