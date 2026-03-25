// Importa a classe Livro do model — é daqui que vêm os métodos de acesso ao banco de dados
import Livro from "../model/Livro.js";
// Importa os tipos Request e Response do Express — representam a requisição e a resposta HTTP
import { type Request, type Response } from "express";
// Importa o tipo LivroDTO para tipar os dados recebidos do front-end
import type LivroDTO from "../dto/LivroDTO.js";

// Define a classe LivroController que HERDA da classe Livro
// A herança permite acessar os métodos estáticos do model diretamente
// O controller é responsável por receber as requisições HTTP e devolver as respostas — nunca acessa o banco diretamente
class LivroController extends Livro {

    // Método que busca todos os livros ativos e os retorna em formato JSON
    // ⚠️ Diferença dos outros controllers: este método não tem JSDoc (comentário de documentação acima dele)
    static async todos(req: Request, res: Response) {
        try {
            // Chama o método do model para buscar todos os livros com status ativo no banco
            const listaDeLivros = await Livro.listarLivros();
            // Retorna a lista em formato JSON com status HTTP 200 (OK — requisição bem-sucedida)
            return res.status(200).json(listaDeLivros);
        } catch (error) {
            // Exibe os detalhes do erro no console do servidor para facilitar o debug
            console.error(`Erro ao listar livros: ${error}`);
            // Retorna mensagem de erro com status HTTP 500 (Internal Server Error)
            return res.status(500).json({ mensagem: "Erro ao recuperar as informações dos livros." });
        }
    }

    // Método que busca um único livro com base no ID informado na URL (ex: GET /livro/3)
    /**
 * Busca um livro específico pelo ID informado na URL.
 * @param req Objeto de requisição HTTP — espera o parâmetro "id" na URL (ex: /livros/1)
 * @param res Objeto de resposta HTTP — retorna o livro encontrado ou mensagem de erro
 */
/**
 * Busca um livro específico pelo ID informado na URL.
 * @param req Objeto de requisição HTTP — espera o parâmetro "id" na URL (ex: /livros/1)
 * @param res Objeto de resposta HTTP — retorna o livro encontrado ou mensagem de erro
 */
static async livro(req: Request, res: Response): Promise<void> {
    try {
        // Lê o parâmetro "id" da URL e converte de string para número inteiro
        // Exemplo de URL: GET /livros/5 → req.params.id = "5" → idLivro = 5
        const idLivro = parseInt(req.params.id as string);

        // Valida se o ID é um número válido — parseInt retorna NaN para valores inválidos
        // Isso evita que uma requisição com ID inválido chegue até o banco de dados
        if (isNaN(idLivro)) {
            res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro." });
            return;
        }

        // Chama o método do model para buscar o livro pelo ID no banco
        const livro = await Livro.listarLivro(idLivro);

        // Se o model retornar null, o livro não existe ou está inativo no banco
        if (!livro) {
            res.status(404).json({ mensagem: "Livro não encontrado." });
            return;
        }

        // Retorna o objeto do livro em JSON com status 200 (OK — requisição bem-sucedida)
        res.status(200).json(livro);

    } catch (error) {
        // Exibe o erro no stream de erro do servidor para facilitar o debug
        console.error(`Erro ao buscar livro: ${error}`);

        // Status 500 — Internal Server Error — erro inesperado no servidor
        res.status(500).json({ mensagem: "Erro interno ao recuperar as informações do livro." });
    }
}

        // Retorna o objeto do livro em JSON com status 200 (OK — requisição be
    // Método que recebe os dados do front-end e cria um novo livro no banco de dados
    /**
 * Cadastra um novo livro no banco de dados.
 * @param req Objeto de requisição HTTP — espera os dados do livro no corpo (body)
 * @param res Objeto de resposta HTTP — retorna mensagem de sucesso ou erro
 */
static async cadastrar(req: Request, res: Response): Promise<void> {
    try {
        // Lê o corpo da requisição e tipifica como LivroDTO
        // O front-end envia os dados em formato JSON no corpo da requisição (POST)
        const dadosRecebidos: LivroDTO = req.body;

        // Valida se os campos obrigatórios foram enviados antes de tentar cadastrar
        // Sem essa verificação, o banco receberia dados inválidos e retornaria um erro genérico
        if (!dadosRecebidos.titulo || !dadosRecebidos.autor || !dadosRecebidos.editora || !dadosRecebidos.isbn) {
            res.status(400).json({ mensagem: "Campos obrigatórios ausentes: titulo, autor, editora e isbn." });
            return;
        }

        // Cria um novo objeto Livro com os dados recebidos do front-end
        // O operador ?? define valores padrão para campos opcionais não enviados
        const novoLivro = new Livro(
            dadosRecebidos.titulo,
            dadosRecebidos.autor,
            dadosRecebidos.editora,
            (dadosRecebidos.ano_publicacao ?? 0).toString(), // Converte para string pois o construtor espera string
            dadosRecebidos.isbn,
            dadosRecebidos.quant_total       ?? 0,           // Padrão 0 se não informado
            dadosRecebidos.quant_disponivel  ?? 0,           // Padrão 0 se não informado
            dadosRecebidos.valor_aquisicao   ?? 0            // Padrão 0 se não informado
        );

        // Chama o método do model para salvar o novo livro no banco de dados
        const result = await Livro.cadastrarLivro(novoLivro);

        // true = INSERT bem-sucedido; false = nenhuma linha foi inserida
        if (result) {
            // Status 201 — Created — recurso criado com sucesso
            // (200 seria para operações genéricas — 201 é o correto para criação)
            res.status(201).json({ mensagem: "Livro cadastrado com sucesso." });
        } else {
            // Status 400 — Bad Request — os dados enviados não permitiram o cadastro
            res.status(400).json({ mensagem: "Não foi possível cadastrar o livro." });
        }

    } catch (error) {
        // Exibe o erro no stream de erro do servidor para facilitar o debug
        console.error(`Erro ao cadastrar livro: ${error}`);

        // Status 500 — Internal Server Error — erro inesperado no servidor
        res.status(500).json({ mensagem: "Erro interno ao cadastrar o livro." });
    }
}
    // Método que recebe um ID pela URL e realiza a remoção lógica do livro no banco
    // "Promise<Response>" indica que este método sempre retorna uma resposta HTTP ao final
    static async remover(req: Request, res: Response): Promise<Response> {
        try {
            // Lê o parâmetro "id" da URL e converte para número inteiro
            // Exemplo de URL: DELETE /livro/5  →  idLivro = 5
            const idLivro = parseInt(req.params.id as string);

            // Chama o método do model para remover (logicamente) o livro com o ID informado
            // O model também desativa todos os empréstimos relacionados antes de desativar o livro
            const result = await Livro.removerLivro(idLivro);

            // Verifica o retorno do model: true = remoção bem-sucedida, false = falha
            if (result) {
                // ⚠️ Observação: usa status HTTP 201 (Created) para uma remoção — o correto seria 200 (OK)
                return res.status(201).json({ mensagem: 'Livro removido com sucesso.' });
            } else {
                // Retorna status HTTP 404 (Not Found) se o livro não foi encontrado ou já estava inativo
                return res.status(404).json({ mensagem: 'Livro não encontrado para exclusão.' });
            }
        } catch (error) {
            // Exibe o erro no console e retorna status HTTP 500 em caso de exceção
            console.error("Erro ao remover o livro: ", error);
            return res.status(500).json({ mensagem: 'Erro ao remover o livro.' });
        }
    }

    // Método que recebe os novos dados do front-end e atualiza o cadastro do livro no banco
    /**
 * Atualiza os dados de um livro existente pelo ID informado na URL.
 * @param req Objeto de requisição HTTP — espera o "id" na URL e os dados atualizados no body
 * @param res Objeto de resposta HTTP — retorna mensagem de sucesso ou erro
 */
static async atualizar(req: Request, res: Response): Promise<void> {
    try {
        // Lê o parâmetro "id" da URL e converte de string para número inteiro
        // Exemplo de URL: PUT /livros/7 → req.params.id = "7" → idLivro = 7
        const idLivro = parseInt(req.params.id as string);

        // Valida se o ID é um número válido — parseInt retorna NaN para valores inválidos
        // Isso evita que uma requisição com ID inválido chegue até o banco de dados
        if (isNaN(idLivro)) {
            res.status(400).json({ mensagem: "ID inválido. Informe um número inteiro." });
            return;
        }

        // Lê o corpo da requisição e tipifica como LivroDTO
        // O front-end envia os dados atualizados em formato JSON no corpo da requisição (PUT)
        const dadosRecebidos: LivroDTO = req.body;

        // Valida se os campos obrigatórios foram enviados antes de tentar atualizar
        // Sem essa verificação, o banco receberia dados inválidos e retornaria um erro genérico
        if (!dadosRecebidos.titulo || !dadosRecebidos.autor || !dadosRecebidos.editora || !dadosRecebidos.isbn) {
            res.status(400).json({ mensagem: "Campos obrigatórios ausentes: titulo, autor, editora e isbn." });
            return;
        }

        // Cria um novo objeto Livro com os dados recebidos do front-end
        // O operador ?? define valores padrão para campos opcionais não enviados
        const livro = new Livro(
            dadosRecebidos.titulo,
            dadosRecebidos.autor,
            dadosRecebidos.editora,
            (dadosRecebidos.ano_publicacao ?? 0).toString(), // Converte para string pois o construtor espera string
            dadosRecebidos.isbn,
            dadosRecebidos.quant_total      ?? 0,            // Padrão 0 se não informado
            dadosRecebidos.quant_disponivel ?? 0,            // Padrão 0 se não informado
            dadosRecebidos.valor_aquisicao  ?? 0             // Padrão 0 se não informado
        );

        // Define o ID no objeto para que o model saiba qual livro atualizar no banco
        livro.setIdLivro(idLivro);

        // Chama o método do model para atualizar os dados no banco de dados
        const result = await Livro.atualizarLivro(livro);

        // true = UPDATE bem-sucedido; false = livro não encontrado ou inativo
        if (result) {
            // Status 200 — OK — atualização realizada com sucesso
            res.status(200).json({ mensagem: "Livro atualizado com sucesso." });
        } else {
            // Status 404 — Not Found — livro não existe ou está inativo no banco
            res.status(404).json({ mensagem: "Livro não encontrado para atualização." });
        }

    } catch (error) {
        // Exibe o erro no stream de erro do servidor para facilitar o debug
        console.error(`Erro ao atualizar livro: ${error}`);

        // Status 500 — Internal Server Error — erro inesperado no servidor
        res.status(500).json({ mensagem: "Erro interno ao atualizar o livro." });
    }
}
}

// Exporta a classe para que possa ser importada nas rotas da aplicação
export default LivroController; 