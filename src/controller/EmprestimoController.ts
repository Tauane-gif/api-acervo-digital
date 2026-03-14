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

}

export default EmprestimoController;