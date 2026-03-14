import Emprestimo from "../model/Emprestimo.js";
import { type Request, type Response } from "express";
import type EmprestimoDTO from "../dto/EmprestimoDTO.js";

class EmprestimoController extends Emprestimo {

    /**
    * Método para listar todos os empréstimos.
    * Retorna um array de empréstimos com informações dos alunos e dos livros.
    */
    static async todos(req: Request, res: Response): Promise<Response> {
        try {
            // Chama o método listarEmprestimos do service
            const listaDeEmprestimos = await Emprestimo.listarEmprestimos();

            // Retorna a lista de empréstimos com status 200 (OK)
            return res.status(200).json(listaDeEmprestimos);
        } catch (error) {
            // Em caso de erro, retorna o erro com status 500 (erro do servidor)
            console.error('Erro ao listar empréstimos:', error);
            return res.status(500).json({ mensagem: 'Erro ao listar os empréstimos.' });
        }
    }

    /**
     * Retorna informações de um empréstimo
     * @param req Objeto de requisição HTTP
     * @param res Objeto de resposta HTTP.
     * @returns Informações de empréstimo em formato JSON.
     */
    static async emprestimo(req: Request, res: Response) {
        try {
            const idEmprestimo: number = parseInt(req.params.id as string);

            const emprestimo = await Emprestimo.listarEmprestimo(idEmprestimo);
            res.status(200).json(emprestimo);
        } catch (error) {
            console.log(`Erro ao acessar método herdado: ${error}`);    // Exibe erros da consulta no console
            res.status(500).json("Erro ao recuperar as informações do aluno.");  // Retorna mensagem de erro com status code 400
        }
    }

    /**
     * Cadastra um novo empréstimo.
     * Recebe os dados do empréstimo a partir da requisição e passa para o serviço.
     */
    static async cadastrar(req: Request, res: Response): Promise<Response> {
        try {
            const dadosRecebidos: EmprestimoDTO = req.body;

            // Chama o serviço para cadastrar o empréstimo
            const result = await Emprestimo.cadastrarEmprestimo(
                dadosRecebidos.aluno.id_aluno,
                dadosRecebidos.livro.id_livro,
                new Date(dadosRecebidos.data_emprestimo),
                dadosRecebidos.data_devolucao ? new Date(dadosRecebidos.data_devolucao) : new Date(),
                dadosRecebidos.status_emprestimo ?? ""
            );

            if (result) {
                // Retorna a resposta de sucesso com o ID do novo empréstimo
                return res.status(201).json({ mensagem: 'Empréstimo cadastrado com sucesso.'});
            } else {
                return res.status(500).json({ mensagem: 'Não foi possível cadastrar o livro no banco de dados.' });
            }
        } catch (error) {
            console.error('Erro ao cadastrar empréstimo:', error);
            return res.status(500).json({ mensagem: 'Erro ao cadastrar o empréstimo.' });
        }
    }
}

export default EmprestimoController;