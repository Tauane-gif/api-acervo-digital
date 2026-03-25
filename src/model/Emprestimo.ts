// Importa o tipo EmprestimoDTO, que define a estrutura de dados de um empréstimo (objeto simples, sem métodos)
import type EmprestimoDTO from "../dto/EmprestimoDTO.js";
// Importa a classe DatabaseModel, responsável por gerenciar a conexão com o banco de dados
import { DatabaseModel } from "./DatabaseModel.js";

// Cria uma instância do DatabaseModel e acessa o pool de conexões com o banco de dados
// O "pool" gerencia múltiplas conexões simultâneas de forma eficiente
const database = new DatabaseModel().pool;

// Define a classe Emprestimo, que representa um empréstimo de livro no sistema
class Emprestimo {

    // Atributo privado: ID único do empréstimo no banco de dados (começa em 0, pois ainda não foi salvo)
    private id_emprestimo: number = 0;
    // Atributo privado: ID do aluno que realizou o empréstimo (chave estrangeira referenciando a tabela Aluno)
    private id_aluno: number;
    // Atributo privado: ID do livro emprestado (chave estrangeira referenciando a tabela Livro)
    private id_livro: number;
    // Atributo privado: Data em que o empréstimo foi realizado
    private data_emprestimo: Date;
    // Atributo privado: Data prevista para devolução do livro
    private data_devolucao: Date;
    // Atributo privado: Situação atual do empréstimo (ex: "Em Andamento", "Devolvido", "Atrasado")
    private status_emprestimo: string;
    // Atributo privado: Indica se o registro está ativo no banco (true = ativo, false = removido logicamente)
    private status_emprestimo_registro: boolean = true;

    // Construtor: chamado automaticamente ao criar um novo objeto Emprestimo
    constructor(
        _id_aluno: number,          // ID do aluno — obrigatório
        _id_livro: number,          // ID do livro — obrigatório
        _data_emprestimo: Date,     // Data do empréstimo — obrigatório
        _status_emprestimo?: string, // Status do empréstimo — opcional (o "?" indica que pode ser omitido)
        _data_devolucao?: Date      // Data de devolução — opcional
    ) {
        // Cria uma cópia da data de empréstimo para calcular a data de devolução padrão
        // Isso é necessário para não modificar o objeto original (_data_emprestimo)
        const dataDevolucaoPadrao = new Date(_data_emprestimo);
        // Adiciona 7 dias à data de empréstimo para definir o prazo padrão de devolução
        // getDate() retorna o dia atual, e setDate() define um novo dia somando +7
        dataDevolucaoPadrao.setDate(dataDevolucaoPadrao.getDate() + 7);

        // Atribui os valores recebidos aos atributos internos da classe
        this.id_aluno = _id_aluno;
        this.id_livro = _id_livro;
        this.data_emprestimo = _data_emprestimo;
        // Se _status_emprestimo não foi informado, usa "Em Andamento" como valor padrão
        // O operador "??" retorna o lado direito se o esquerdo for null ou undefined
        this.status_emprestimo = _status_emprestimo ?? "Em Andamento";
        // Se _data_devolucao não foi informada, usa a data calculada automaticamente (empréstimo + 7 dias)
        this.data_devolucao = _data_devolucao ?? dataDevolucaoPadrao;
    }

    // ==================== GETTERS E SETTERS ====================
    // Métodos públicos para acessar e modificar os atributos privados da classe com segurança

    // Getter: retorna o ID do empréstimo
    public getIdEmprestimo(): number {
        return this.id_emprestimo;
    }
    // Setter: define um novo valor para o ID do empréstimo
    public setIdEmprestimo(value: number) {
        this.id_emprestimo = value;
    }

    // Getter: retorna o ID do aluno vinculado ao empréstimo
    public getIdAluno(): number {
        return this.id_aluno;
    }
    // Setter: define um novo ID de aluno para o empréstimo
    public setIdAluno(value: number) {
        this.id_aluno = value;
    }

    // Getter: retorna o ID do livro vinculado ao empréstimo
    public getIdLivro(): number {
        return this.id_livro;
    }
    // Setter: define um novo ID de livro para o empréstimo
    public setIdLivro(value: number) {
        this.id_livro = value;
    }

    // Getter: retorna a data em que o empréstimo foi realizado
    public getDataEmprestimo(): Date {
        return this.data_emprestimo;
    }
    // Setter: define uma nova data de empréstimo
    public setDataEmprestimo(value: Date) {
        this.data_emprestimo = value;
    }

    // Getter: retorna a data prevista de devolução do livro
    public getDataDevolucao(): Date {
        return this.data_devolucao;
    }
    // Setter: define uma nova data de devolução
    public setDataDevolucao(value: Date) {
        this.data_devolucao = value;
    }

    // Getter: retorna o status atual do empréstimo (ex: "Em Andamento", "Devolvido")
    public getStatusEmprestimo(): string {
        return this.status_emprestimo;
    }
    // Setter: define um novo status para o empréstimo
    public setStatusEmprestimo(value: string) {
        this.status_emprestimo = value;
    }

    // Getter: retorna se o registro do empréstimo está ativo (true) ou removido logicamente (false)
    public getStatusEmprestimoRegistro(): boolean {
        return this.status_emprestimo_registro;
    }
    // Setter: define o status do registro do empréstimo
    public setStatusEmprestimoRegistro(value: boolean) {
        this.status_emprestimo_registro = value;
    }

    // ==================== MÉTODOS ESTÁTICOS (operações no banco de dados) ====================
    // Métodos "static" pertencem à classe, não ao objeto — são chamados como Emprestimo.listarEmprestimos()

    /**
    * Retorna uma lista com todos os Emprestimos cadastrados no banco de dados
    * 
    * @returns Lista com todos os Emprestimos cadastrados no banco de dados
    */
    // Método assíncrono que busca todos os empréstimos ativos e retorna uma lista de EmprestimoDTO ou null
    static async listarEmprestimos(): Promise<EmprestimoDTO[] | null> {

    // Query com JOIN — une três tabelas em uma única consulta ao banco
    // Isso é mais eficiente que fazer consultas separadas para cada tabela
    // WHERE status_emprestimo_registro = TRUE: traz apenas registros ativos (não removidos logicamente)
    const querySelectEmprestimo = `
        SELECT
            e.id_emprestimo,
            e.data_emprestimo,
            e.data_devolucao,
            e.status_emprestimo,
            e.status_emprestimo_registro,
            a.id_aluno,
            a.ra,
            a.nome,
            a.sobrenome,
            a.celular,
            a.email,
            l.id_livro,
            l.titulo,
            l.autor,
            l.editora,
            l.isbn
        FROM Emprestimo e
        JOIN Aluno a ON e.id_aluno = a.id_aluno
        JOIN Livro l ON e.id_livro = l.id_livro
        WHERE e.status_emprestimo_registro = TRUE;
    `;

    try {
        // await pausa a execução até o banco responder — isso é programação assíncrona
        // Sem o await, o código continuaria antes de ter os dados prontos
        const respostaBD = await database.query(querySelectEmprestimo);

        // Se nenhuma linha foi retornada, não há empréstimos ativos no banco
        if (respostaBD.rows.length === 0) return null;

        // .map() transforma cada linha retornada em um objeto EmprestimoDTO
        // É mais limpo e eficiente que criar uma lista vazia e usar forEach + push
        const listaDeEmprestimos: EmprestimoDTO[] = respostaBD.rows.map((linha) => ({
            id_emprestimo:              linha.id_emprestimo,
            data_emprestimo:            linha.data_emprestimo,
            data_devolucao:             linha.data_devolucao,
            status_emprestimo:          linha.status_emprestimo,
            status_emprestimo_registro: linha.status_emprestimo_registro,

            // Objeto aninhado com os dados do aluno vinculado ao empréstimo
            // Os dados vêm da mesma linha graças ao JOIN com a tabela Aluno
            aluno: {
                id_aluno:  linha.id_aluno,
                ra:        linha.ra,
                nome:      linha.nome,
                sobrenome: linha.sobrenome,
                celular:   linha.celular,
                email:     linha.email,
            },

            // Objeto aninhado com os dados do livro vinculado ao empréstimo
            // Os dados vêm da mesma linha graças ao JOIN com a tabela Livro
            livro: {
                id_livro: linha.id_livro,
                titulo:   linha.titulo,
                autor:    linha.autor,
                editora:  linha.editora,
                isbn:     linha.isbn,
            },
        }));

        return listaDeEmprestimos;

    } catch (error) {
        // Verifica se o erro é uma instância de Error para acessar a mensagem com segurança
        if (error instanceof Error) {
            // throw envia o erro para o controller — ele decide como responder ao cliente
            throw new Error(`Erro ao listar empréstimos: ${error.message}`);
        }
        throw error;
    }
}

    /**
     * Retorna as informações de um empréstimo informado pelo ID
     * 
     * @param id_emprestimo Identificador único do empréstimo
     * @returns Objeto com informações do empréstimo
     */
    // Recebe o ID do empréstimo e retorna um único EmprestimoDTO ou null
    static async listarEmprestimo(id_emprestimo: number): Promise<EmprestimoDTO | null> {
        try {
            // Query SQL com JOIN igual ao listarEmprestimos, mas filtrando por um ID específico
            // O "$1" é o placeholder que será substituído pelo valor de id_emprestimo (proteção contra SQL Injection)
            const querySelectEmprestimo = `SELECT e.id_emprestimo, e.id_aluno, e.id_livro,
                       e.data_emprestimo, e.data_devolucao, e.status_emprestimo, e.status_emprestimo_registro,
                       a.ra, a.nome, a.sobrenome, a.celular, a.email,
                       l.titulo, l.autor, l.editora, l.isbn
                FROM Emprestimo e
                JOIN Aluno a ON e.id_aluno = a.id_aluno
                JOIN Livro l ON e.id_livro = l.id_livro
                WHERE e.id_emprestimo = $1;`;

            // Executa a query passando o id_emprestimo como parâmetro (substitui o $1)
            const respostaBD = await database.query(querySelectEmprestimo, [id_emprestimo]);

            // Monta o objeto EmprestimoDTO com os dados da primeira (e única) linha retornada
            // rows[0] acessa a primeira linha do resultado
            const emprestimoDTO: EmprestimoDTO = {
                id_emprestimo: respostaBD.rows[0].id_emprestimo,
                data_emprestimo: respostaBD.rows[0].data_emprestimo,
                data_devolucao: respostaBD.rows[0].data_devolucao,
                status_emprestimo: respostaBD.rows[0].status_emprestimo,
                status_emprestimo_registro: respostaBD.rows[0].status_emprestimo_registro,
                // Objeto aninhado com dados do aluno
                aluno: {
                    id_aluno: respostaBD.rows[0].id_aluno,
                    ra: respostaBD.rows[0].ra,
                    nome: respostaBD.rows[0].nome,
                    sobrenome: respostaBD.rows[0].sobrenome,
                    celular: respostaBD.rows[0].celular,
                    email: respostaBD.rows[0].email
                },
                // Objeto aninhado com dados do livro
                livro: {
                    id_livro: respostaBD.rows[0].id_livro,
                    titulo: respostaBD.rows[0].titulo,
                    autor: respostaBD.rows[0].autor,
                    editora: respostaBD.rows[0].editora,
                    isbn: respostaBD.rows[0].isbn
                }
            };

            // Retorna o objeto empréstimo montado com os dados do banco
            return emprestimoDTO;
        } catch (error) {
            // Exibe o erro no console e retorna null em caso de falha
            console.error(`Erro ao realizar consulta: ${error}`);
            return null;
        }
    }

    /**
     * Cadastra um novo empréstimo no banco de dados
     */
    // Recebe um objeto Emprestimo completo e tenta inseri-lo no banco
    static async cadastrarEmprestimo(emprestimo: Emprestimo): Promise<boolean> {

    // Query de inserção — $1 a $5 são placeholders substituídos pelos valores reais na execução
    // Isso evita SQL Injection — nunca concatene valores diretamente na query
    // RETURNING id_emprestimo faz o banco retornar o ID gerado automaticamente após o INSERT
    const queryInsertEmprestimo = `
        INSERT INTO Emprestimo (id_aluno, id_livro, data_emprestimo, data_devolucao, status_emprestimo)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id_emprestimo;
    `;

    // Valores separados da query para facilitar leitura e manutenção
    // A ordem deve ser a mesma dos placeholders ($1, $2, $3...)
    const valores = [
        emprestimo.id_aluno,
        emprestimo.id_livro,
        emprestimo.data_emprestimo,
        emprestimo.data_devolucao,
        emprestimo.status_emprestimo,
    ];

    try {
        // await pausa a execução até o banco responder — isso é programação assíncrona
        const resultado = await database.query(queryInsertEmprestimo, valores);

        // rowCount indica quantas linhas foram inseridas
        // O operador ?? garante que null/undefined seja tratado como 0
        return (resultado.rowCount ?? 0) > 0;

    } catch (error) {
        // Verifica se o erro é uma instância de Error para acessar a mensagem com segurança
        if (error instanceof Error) {
            // throw envia o erro para o controller — ele decide como responder ao cliente
            throw new Error(`Erro ao cadastrar empréstimo: ${error.message}`);
        }
        throw error;
    }
}
    /**
     * Atualiza os dados de um empréstimo existente no banco de dados
     */
    // Diferente dos outros métodos, este recebe os dados separados como parâmetros individuais (não um objeto Emprestimo)
   static async atualizarEmprestimo(
    id_emprestimo:    number,  // ID do empréstimo a ser atualizado (usado no WHERE)
    id_aluno:         number,  // Novo ID do aluno
    id_livro:         number,  // Novo ID do livro
    data_emprestimo:  Date,    // Nova data de empréstimo
    data_devolucao:   Date,    // Nova data de devolução
    status_emprestimo: string  // Novo status do empréstimo
): Promise<boolean> {

    // Query de atualização — WHERE garante que apenas o empréstimo com o ID correto seja alterado
    // $1 a $5 atualizam os campos; $6 identifica qual registro atualizar no WHERE
    const queryUpdateEmprestimo = `
        UPDATE Emprestimo SET
            id_aluno          = $1,
            id_livro          = $2,
            data_emprestimo   = $3,
            data_devolucao    = $4,
            status_emprestimo = $5
        WHERE id_emprestimo = $6
        RETURNING id_emprestimo;
    `;

    // Valores na mesma ordem dos placeholders ($1, $2, $3...)
    // id_emprestimo vai por último pois é usado no WHERE, não no SET
    const valores = [
        id_aluno,
        id_livro,
        data_emprestimo,
        data_devolucao,
        status_emprestimo,
        id_emprestimo,
    ];

    try {
        // await pausa a execução até o banco responder — isso é programação assíncrona
        const resultado = await database.query(queryUpdateEmprestimo, valores);

        // Se nenhuma linha foi afetada, o ID informado não existe no banco
        if (resultado.rowCount === 0) return false;

        // Se chegou aqui, a atualização foi bem-sucedida
        return true;

    } catch (error) {
        // Verifica se o erro é uma instância de Error para acessar a mensagem com segurança
        if (error instanceof Error) {
            // throw envia o erro para o controller — ele decide como responder ao cliente
            throw new Error(`Erro ao atualizar empréstimo: ${error.message}`);
        }
        throw error;
    }
}

    /**
     * Remove um empréstimo ativo do banco de dados
     * 
     * @param id_emprestimo 
     * @returns true caso o empréstimo tenha sido removido, false caso contrário
     */
    // Realiza uma remoção lógica: não apaga o registro, apenas muda o status para FALSE
    static async removerEmprestimo(id_emprestimo: number): Promise<boolean> {

    // Remoção lógica — usa UPDATE em vez de DELETE para preservar o histórico no banco
    // $1 é um placeholder substituído pelo valor de id_emprestimo na execução
    // Isso evita SQL Injection — nunca concatene valores diretamente na query
    const queryDeleteEmprestimo = `
        UPDATE emprestimo
        SET status_emprestimo_registro = FALSE
        WHERE id_emprestimo = $1;
    `;

    try {
        // await pausa a execução até o banco responder — isso é programação assíncrona
        const respostaBD = await database.query(queryDeleteEmprestimo, [id_emprestimo]);

        // rowCount indica quantas linhas foram afetadas pelo UPDATE
        // O operador ?? garante que null/undefined seja tratado como 0
        return (respostaBD.rowCount ?? 0) > 0;

    } catch (error) {
        // Verifica se o erro é uma instância de Error para acessar a mensagem com segurança
        if (error instanceof Error) {
            // throw envia o erro para o controller — ele decide como responder ao cliente
            throw new Error(`Erro ao remover empréstimo: ${error.message}`);
        }
        throw error;
    }
}
}

// Exporta a classe Emprestimo para que possa ser importada e usada em outros arquivos do projeto
export default Emprestimo;