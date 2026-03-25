// Importa o tipo LivroDTO, que define a estrutura de dados de um livro (objeto simples, sem métodos)
import type LivroDTO from "../dto/LivroDTO.js";
// Importa a classe DatabaseModel, responsável por gerenciar a conexão com o banco de dados
import { DatabaseModel } from "./DatabaseModel.js";

// Cria uma instância do DatabaseModel e acessa o pool de conexões com o banco de dados
// O "pool" gerencia múltiplas conexões simultâneas de forma eficiente
const database = new DatabaseModel().pool;

// Define a classe Livro, que representa um livro no sistema de biblioteca
class Livro {
    // Atributo privado: ID único do livro no banco de dados (começa em 0, pois ainda não foi salvo)
    private id_livro: number = 0;
    // Atributo privado: Título do livro
    private titulo: string;
    // Atributo privado: Nome do autor do livro
    private autor: string;
    // Atributo privado: Nome da editora responsável pela publicação
    private editora: string;
    // Atributo privado: Ano em que o livro foi publicado (string para suportar formatos como "2024")
    private ano_publicacao: string;
    // Atributo privado: Código ISBN — identificador único internacional de livros
    private isbn: string;
    // Atributo privado: Quantidade total de exemplares do livro no acervo
    private quant_total: number;
    // Atributo privado: Quantidade de exemplares disponíveis para empréstimo no momento
    private quant_disponivel: number;
    // Atributo privado: Valor pago para adquirir o livro
    private valor_aquisicao: number;
    // Atributo privado: Indica se o livro está disponível ou emprestado (começa como "Disponível")
    private status_livro_emprestado: string = "Disponível";
    // Atributo privado: Indica se o livro está ativo no sistema (false = ainda não persistido no banco)
    private status_livro: boolean = false;

    // Construtor: chamado automaticamente ao criar um novo objeto Livro
    constructor(
        _titulo: string,           // Título do livro — obrigatório
        _autor: string,            // Autor do livro — obrigatório
        _editora: string,          // Editora do livro — obrigatório
        _ano_publicacao: string,   // Ano de publicação — obrigatório
        _isbn: string,             // ISBN do livro — obrigatório
        _quant_total: number,      // Quantidade total de exemplares — obrigatório
        _quant_disponivel: number, // Quantidade disponível para empréstimo — obrigatório
        _valor_aquisicao: number   // Valor de aquisição — obrigatório
    ) {
        // Atribui os valores recebidos aos atributos internos da classe
        this.titulo = _titulo;
        this.autor = _autor;
        this.editora = _editora;
        this.ano_publicacao = _ano_publicacao;
        this.isbn = _isbn;
        this.quant_total = _quant_total;
        this.quant_disponivel = _quant_disponivel;
        this.valor_aquisicao = _valor_aquisicao;
    }

    // ==================== GETTERS E SETTERS ====================
    // Métodos públicos para acessar e modificar os atributos privados com segurança

    // Getter: retorna o ID do livro
    public getIdLivro(): number {
        return this.id_livro;
    }
    // Setter: define um novo valor para o ID do livro
    public setIdLivro(value: number) {
        this.id_livro = value;
    }

    // Getter: retorna o título do livro
    public getTitulo(): string {
        return this.titulo;
    }
    // Setter: define um novo título para o livro
    public setTitulo(value: string) {
        this.titulo = value;
    }

    // Getter: retorna o nome do autor do livro
    public getAutor(): string {
        return this.autor;
    }
    // Setter: define um novo autor para o livro
    public setAutor(value: string) {
        this.autor = value;
    }

    // Getter: retorna o nome da editora do livro
    public getEditora(): string {
        return this.editora;
    }
    // Setter: define uma nova editora para o livro
    public setEditora(value: string) {
        this.editora = value;
    }

    // Getter: retorna o ano de publicação do livro
    public getAnoPublicacao(): string {
        return this.ano_publicacao;
    }
    // Setter: define um novo ano de publicação para o livro
    public setAnoPublicacao(value: string) {
        this.ano_publicacao = value;
    }

    // Getter: retorna o ISBN do livro
    public getIsbn(): string {
        return this.isbn;
    }
    // Setter: define um novo ISBN para o livro
    public setIsbn(value: string) {
        this.isbn = value;
    }

    // Getter: retorna a quantidade total de exemplares do livro
    public getQuantTotal(): number {
        return this.quant_total;
    }
    // Setter: define uma nova quantidade total de exemplares
    public setQuantTotal(value: number) {
        this.quant_total = value;
    }

    // Getter: retorna a quantidade de exemplares disponíveis para empréstimo
    public getQuantDisponivel(): number {
        return this.quant_disponivel;
    }
    // Setter: define uma nova quantidade de exemplares disponíveis
    public setQuantDisponivel(value: number) {
        this.quant_disponivel = value;
    }

    // Getter: retorna o valor de aquisição do livro
    public getValorAquisicao(): number {
        return this.valor_aquisicao;
    }
    // Setter: define um novo valor de aquisição para o livro
    public setValorAquisicao(value: number) {
        this.valor_aquisicao = value;
    }

    // Getter: retorna o status de empréstimo do livro (ex: "Disponível", "Emprestado")
    public getStatusLivroEmprestado(): string {
        return this.status_livro_emprestado;
    }
    // Setter: define um novo status de empréstimo para o livro
    public setStatusLivroEmprestado(value: string) {
        this.status_livro_emprestado = value;
    }

    // Getter: retorna se o livro está ativo no sistema (true) ou removido logicamente (false)
    public getStatusLivro(): boolean {
        return this.status_livro;
    }
    // Setter: define o status de atividade do livro no sistema
    public setStatusLivro(value: boolean) {
        this.status_livro = value;
    }

    // ==================== MÉTODOS ESTÁTICOS (operações no banco de dados) ====================
    // Métodos "static" pertencem à classe, não ao objeto — são chamados como Livro.listarLivros()

    /**
     * Retorna uma lista com todos os livros cadastrados no banco de dados
     * 
     * @returns Lista com todos os livros cadastrados no banco de dados
     */
    // Método assíncrono que busca todos os livros ativos e retorna uma lista de LivroDTO ou null
    static async listarLivros(): Promise<LivroDTO[] | null> {

    // Colunas explícitas — mais seguro e eficiente que SELECT *
    // SELECT * traria todas as colunas, inclusive dados sensíveis ou desnecessários
    // WHERE status_livro = TRUE: traz apenas livros ativos (não removidos logicamente)
    const querySelectLivro = `
        SELECT
            id_livro,
            titulo,
            autor,
            editora,
            ano_publicacao,
            isbn,
            quant_total,
            quant_disponivel,
            valor_aquisicao,
            status_livro_emprestado,
            status_livro
        FROM Livro
        WHERE status_livro = TRUE;
    `;

    try {
        // await pausa a execução até o banco responder — isso é programação assíncrona
        // Sem o await, o código continuaria antes de ter os dados prontos
        const respostaBD = await database.query(querySelectLivro);

        // Se nenhuma linha foi retornada, não há livros ativos no banco
        if (respostaBD.rows.length === 0) return null;

        // .map() transforma cada linha retornada em um objeto LivroDTO
        // É mais limpo e eficiente que criar uma lista vazia e usar forEach + push
        // LivroDTO é um objeto simples de dados (sem métodos), diferente da classe Livro
        const listaDeLivros: LivroDTO[] = respostaBD.rows.map((livro) => ({
            id_livro:               livro.id_livro,
            titulo:                 livro.titulo,
            autor:                  livro.autor,
            editora:                livro.editora,
            ano_publicacao:         livro.ano_publicacao,
            isbn:                   livro.isbn,
            quant_total:            livro.quant_total,
            quant_disponivel:       livro.quant_disponivel,
            valor_aquisicao:        livro.valor_aquisicao,
            status_livro_emprestado: livro.status_livro_emprestado,
            status_livro:           livro.status_livro,
        }));

        return listaDeLivros;

    } catch (error) {
        // Verifica se o erro é uma instância de Error para acessar a mensagem com segurança
        if (error instanceof Error) {
            // throw envia o erro para o controller — ele decide como responder ao cliente
            throw new Error(`Erro ao listar livros: ${error.message}`);
        }
        throw error;
    }
}

    /**
     * Retorna as informações de um livro informado pelo ID
     * 
     * @param id_livro Identificador único do livro
     * @returns Objeto com informações do livro
     */
    // Recebe o ID do livro e retorna um único LivroDTO ou null
    static async listarLivro(id_livro: number): Promise<LivroDTO | null> {

    // Colunas explícitas — mais seguro e eficiente que SELECT *
    // $1 é um placeholder substituído pelo valor de id_livro na execução
    // Isso evita SQL Injection — nunca concatene valores diretamente na query
    const querySelectLivro = `
        SELECT
            id_livro,
            titulo,
            autor,
            editora,
            ano_publicacao,
            isbn,
            quant_total,
            quant_disponivel,
            valor_aquisicao,
            status_livro_emprestado,
            status_livro
        FROM livro
        WHERE id_livro = $1;
    `;

    try {
        // await pausa a execução até o banco responder — isso é programação assíncrona
        const respostaBD = await database.query(querySelectLivro, [id_livro]);

        // Se nenhuma linha foi retornada, o livro não existe no banco
        if (respostaBD.rows.length === 0) return null;

        // Atalho para não repetir respostaBD.rows[0] em cada propriedade
        // Esperamos apenas um resultado pois filtramos por ID único
        const linha = respostaBD.rows[0];

        // Monta o objeto LivroDTO com os dados retornados pelo banco
        // LivroDTO é um objeto simples de dados (sem métodos), diferente da classe Livro
        const livroDTO: LivroDTO = {
            id_livro:                linha.id_livro,
            titulo:                  linha.titulo,
            autor:                   linha.autor,
            editora:                 linha.editora,
            ano_publicacao:          linha.ano_publicacao,
            isbn:                    linha.isbn,
            quant_total:             linha.quant_total,
            quant_disponivel:        linha.quant_disponivel,
            valor_aquisicao:         linha.valor_aquisicao,
            status_livro_emprestado: linha.status_livro_emprestado,
            status_livro:            linha.status_livro,
        };

        return livroDTO;

    } catch (error) {
        // Verifica se o erro é uma instância de Error para acessar a mensagem com segurança
        if (error instanceof Error) {
            // throw envia o erro para o controller — ele decide como responder ao cliente
            throw new Error(`Erro ao listar livro: ${error.message}`);
        }
        throw error;
    }
}

    /**
     * Cadastra um novo livro no banco de dados
     * @param livro Objeto Livro contendo as informações a serem cadastradas
     * @returns Boolean indicando se o cadastro foi bem-sucedido
     */
    // Recebe um objeto Livro completo e tenta inseri-lo no banco de dados
    static async cadastrarLivro(livro: Livro): Promise<boolean> {

    // Query de inserção — $1 a $9 são placeholders substituídos pelos valores reais na execução
    // Isso evita SQL Injection — nunca concatene valores diretamente na query
    // RETURNING id_livro faz o banco retornar o ID gerado automaticamente após o INSERT
    const queryInsertLivro = `
        INSERT INTO Livro (
            titulo,
            autor,
            editora,
            ano_publicacao,
            isbn,
            quant_total,
            quant_disponivel,
            valor_aquisicao,
            status_livro_emprestado
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id_livro;
    `;

    // Valores na mesma ordem dos placeholders ($1, $2, $3...)
    // .toUpperCase().trim() padroniza textos em maiúsculas e remove espaços acidentais
    const valores = [
        livro.getTitulo().toUpperCase().trim(),               // $1 — Título
        livro.getAutor().toUpperCase().trim(),                // $2 — Autor
        livro.getEditora().toUpperCase().trim(),              // $3 — Editora
        livro.getAnoPublicacao().toUpperCase().trim(),        // $4 — Ano de publicação
        livro.getIsbn().toUpperCase().trim(),                 // $5 — ISBN
        livro.getQuantTotal(),                                // $6 — Quantidade total
        livro.getQuantDisponivel(),                           // $7 — Quantidade disponível
        livro.getValorAquisicao(),                            // $8 — Valor de aquisição
        livro.getStatusLivroEmprestado().toUpperCase().trim(),// $9 — Status de empréstimo
    ];

    try {
        // await pausa a execução até o banco responder — isso é programação assíncrona
        const result = await database.query(queryInsertLivro, valores);

        // rows.length > 0 confirma que o INSERT retornou o ID gerado — cadastro bem-sucedido
        return result.rows.length > 0;

    } catch (error) {
        // Verifica se o erro é uma instância de Error para acessar a mensagem com segurança
        if (error instanceof Error) {
            // throw envia o erro para o controller — ele decide como responder ao cliente
            throw new Error(`Erro ao cadastrar livro: ${error.message}`);
        }
        throw error;
    }
}

    /**
     * Remove um livro do banco de dados
     * @param id_livro ID do livro a ser removido
     * @returns Boolean indicando se a remoção foi bem-sucedida
    */
    // Realiza uma remoção lógica: não apaga o registro, apenas muda o status para FALSE
    static async removerLivro(id_livro: number): Promise<boolean> {

    // Desativa todos os empréstimos vinculados ao livro antes de removê-lo
    // Garante consistência dos dados — um livro removido não pode ter empréstimos ativos
    const queryDesativarEmprestimos = `
        UPDATE emprestimo
        SET status_emprestimo_registro = FALSE
        WHERE id_livro = $1;
    `;

    // Remoção lógica do livro — usa UPDATE em vez de DELETE para preservar o histórico
    const queryDesativarLivro = `
        UPDATE livro
        SET status_livro = FALSE
        WHERE id_livro = $1;
    `;

    try {
        // Verifica se o livro existe no banco e está ativo antes de tentar remover
        const livro: LivroDTO | null = await this.listarLivro(id_livro);

        // Se o livro não existir ou já estiver inativo, encerra sem executar os UPDATEs
        if (!livro || !livro.status_livro) return false;

        // Desativa os empréstimos primeiro — ordem importa para manter a consistência dos dados
        await database.query(queryDesativarEmprestimos, [id_livro]);

        // Desativa o livro e verifica se o UPDATE afetou alguma linha
        const result = await database.query(queryDesativarLivro, [id_livro]);

        // rowCount indica quantas linhas foram afetadas pelo UPDATE
        // O operador ?? garante que null/undefined seja tratado como 0
        return (result.rowCount ?? 0) > 0;

    } catch (error) {
        // Verifica se o erro é uma instância de Error para acessar a mensagem com segurança
        if (error instanceof Error) {
            // throw envia o erro para o controller — ele decide como responder ao cliente
            throw new Error(`Erro ao remover livro: ${error.message}`);
        }
        throw error;
    }
}
    /**
     * Atualiza os dados de um livro no banco de dados.
     * @param livro Objeto do tipo Livro com os novos dados
     * @returns true caso sucesso, false caso erro
     */
    // Recebe um objeto Livro com os dados atualizados e os salva no banco
    static async atualizarLivro(livro: Livro): Promise<boolean> {

    // Query de atualização — $1 a $9 atualizam os campos; $10 identifica o registro no WHERE
    // Isso evita SQL Injection — nunca concatene valores diretamente na query
    const queryAtualizarLivro = `
        UPDATE Livro SET
            titulo                  = $1,
            autor                   = $2,
            editora                 = $3,
            ano_publicacao          = $4,
            isbn                    = $5,
            quant_total             = $6,
            quant_disponivel        = $7,
            valor_aquisicao         = $8,
            status_livro_emprestado = $9
        WHERE id_livro = $10;
    `;

    // Valores na mesma ordem dos placeholders ($1, $2, $3...)
    // .toUpperCase().trim() padroniza textos em maiúsculas e remove espaços acidentais
    const valores = [
        livro.getTitulo().toUpperCase().trim(),                // $1 — Título
        livro.getAutor().toUpperCase().trim(),                 // $2 — Autor
        livro.getEditora().toUpperCase().trim(),               // $3 — Editora
        livro.getAnoPublicacao().toUpperCase().trim(),         // $4 — Ano de publicação
        livro.getIsbn().toUpperCase().trim(),                  // $5 — ISBN
        livro.getQuantTotal(),                                 // $6 — Quantidade total
        livro.getQuantDisponivel(),                            // $7 — Quantidade disponível
        livro.getValorAquisicao(),                             // $8 — Valor de aquisição
        livro.getStatusLivroEmprestado().toUpperCase().trim(), // $9 — Status de empréstimo
        livro.getIdLivro(),                                    // $10 — ID usado no WHERE
    ];

    try {
        // Verifica se o livro existe no banco e está ativo antes de tentar atualizar
        const livroExistente: LivroDTO | null = await this.listarLivro(livro.getIdLivro());

        // Se o livro não existir ou estiver inativo, encerra sem executar o UPDATE
        if (!livroExistente || !livroExistente.status_livro) return false;

        // Executa o UPDATE no banco com os valores preparados
        const respostaBD = await database.query(queryAtualizarLivro, valores);

        // rowCount indica quantas linhas foram afetadas pelo UPDATE
        // O operador ?? garante que null/undefined seja tratado como 0
        return (respostaBD.rowCount ?? 0) > 0;

    } catch (error) {
        // Verifica se o erro é uma instância de Error para acessar a mensagem com segurança
        if (error instanceof Error) {
            // throw envia o erro para o controller — ele decide como responder ao cliente
            throw new Error(`Erro ao atualizar livro: ${error.message}`);
        }
        throw error;
    }
}
}

// Exporta a classe para que possa ser importada em outros arquivos do projeto
export default Livro;