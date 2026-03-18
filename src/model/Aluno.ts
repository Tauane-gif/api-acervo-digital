// Importa o tipo AlunoDTO, que define a "forma" dos dados de um aluno (como um molde/contrato)
import type AlunoDTO from "../dto/AlunoDTO.js";
// Importa a classe DatabaseModel, responsável por gerenciar a conexão com o banco de dados
import { DatabaseModel } from "./DatabaseModel.js";

// Cria uma instância do DatabaseModel e acessa o pool de conexões com o banco de dados
// O "pool" é um conjunto de conexões reutilizáveis, mais eficiente que abrir/fechar uma por vez
const database = new DatabaseModel().pool;

// Define a classe Aluno, que representa um aluno no sistema







class Aluno {

    // Atributo privado: ID único do aluno no banco de dados (começa em 0, pois ainda não foi salvo)
    private id_aluno: number = 0;
    // Atributo privado: Registro Acadêmico do aluno (começa vazio)
    private ra: string = "";
    // Atributo privado: Primeiro nome do aluno
    private nome: string;
    // Atributo privado: Sobrenome do aluno
    private sobrenome: string;
    // Atributo privado: Data de nascimento do aluno
    private data_nascimento: Date;
    // Atributo privado: Endereço residencial do aluno
    private endereco: string;
    // Atributo privado: E-mail do aluno
    private email: string;
    // Atributo privado: Número de celular do aluno
    private celular: string;
    // Atributo privado: Status do aluno (true = ativo, false = inativo/removido)
    private status_aluno: boolean = true;

    // Construtor: método especial chamado automaticamente ao criar um novo objeto Aluno
    // Os parâmetros com "_" na frente são uma convenção para diferenciar dos atributos da classe
    constructor(
        _nome: string,           // Nome obrigatório
        _sobrenome: string,      // Sobrenome obrigatório
        _data_nascimento: Date,  // Data de nascimento obrigatória
        _endereco: string,       // Endereço obrigatório
        _email: string,          // E-mail obrigatório
        _celular?: string        // Celular opcional (o "?" indica que pode ser omitido)
    ) {
        // Atribui o valor recebido ao atributo interno da classe
        this.nome = _nome;
        this.sobrenome = _sobrenome;
        this.data_nascimento = _data_nascimento;
        this.endereco = _endereco;
        this.email = _email;
        // Se _celular foi informado, usa esse valor; senão, usa string vazia ("")
        // O operador "??" é chamado de "nullish coalescing" — retorna o lado direito se o esquerdo for null/undefined
        this.celular = _celular ?? "";
    }

    // ==================== GETTERS E SETTERS ====================
    // Getters e setters são métodos públicos que permitem ler/alterar atributos privados com segurança

    // Getter: retorna o ID do aluno
    public getIdAluno(): number {
        return this.id_aluno;
    }

    // Setter: define um novo valor para o ID do aluno
    public setIdAluno(id_aluno: number): void {
        this.id_aluno = id_aluno;
    }

    // Getter: retorna o RA do aluno
    public getRa(): string {
        return this.ra;
    }

    // Setter: define um novo valor para o RA do aluno
    public setRa(ra: string): void {
        this.ra = ra;
    }

    // Getter: retorna o nome do aluno
    public getNome(): string {
        return this.nome;
    }

    // Setter: define um novo valor para o nome do aluno
    public setNome(nome: string): void {
        this.nome = nome;
    }

    // Getter: retorna o sobrenome do aluno
    public getSobrenome(): string {
        return this.sobrenome;
    }

    // Setter: define um novo valor para o sobrenome do aluno
    public setSobrenome(sobrenome: string): void {
        this.sobrenome = sobrenome;
    }

    // Getter: retorna a data de nascimento do aluno
    public getDataNascimento(): Date {
        return this.data_nascimento;
    }

    // Setter: define uma nova data de nascimento para o aluno
    public setDataNascimento(data_nascimento: Date): void {
        this.data_nascimento = data_nascimento;
    }

    // Getter: retorna o endereço do aluno
    public getEndereco(): string {
        return this.endereco;
    }

    // Setter: define um novo endereço para o aluno
    public setEndereco(endereco: string): void {
        this.endereco = endereco;
    }

    // Getter: retorna o e-mail do aluno
    public getEmail(): string {
        return this.email;
    }

    // Setter: define um novo e-mail para o aluno
    public setEmail(email: string): void {
        this.email = email;
    }

    // Getter: retorna o celular do aluno
    public getCelular(): string {
        return this.celular;
    }

    // Setter: define um novo número de celular para o aluno
    public setCelular(celular: string): void {
        this.celular = celular;
    }

    // Getter duplicado do RA (mesma função que getRa acima — provavelmente um erro de duplicidade no código original)
    public getRA(): string {
        return this.ra;
    }

    // Setter duplicado do RA (mesma função que setRa acima)
    public setRA(ra: string): void {
        this.ra = ra;
    }

    // Getter: retorna o status do aluno (true = ativo, false = inativo)
    public getStatusAluno(): boolean {
        return this.status_aluno;
    }

    // Setter: define um novo status para o aluno
    public setStatusAluno(status_aluno: boolean): void {
        this.status_aluno = status_aluno;
    }

    // ==================== MÉTODOS ESTÁTICOS (operações no banco de dados) ====================
    // Métodos "static" pertencem à classe, não ao objeto — são chamados como Aluno.listarAlunos()

    /**
     * Retorna uma lista com todos os alunos cadastrados no banco de dados
     * 
     * @returns Lista com todos os alunos cadastrados no banco de dados
     */
    // "async" indica que este método é assíncrono — ele pode "esperar" por operações demoradas (como banco de dados)
    // Retorna uma Promise que, quando resolvida, contém um Array de AlunoDTO ou null
    static async listarAlunos(): Promise<AlunoDTO[] | null> {
    try {
        // ✅ MELHORIA 1: Selecione apenas as colunas que você realmente precisa.
        // "SELECT *" traz tudo do banco — inclusive dados futuros que você
        // talvez não queira expor. Colunas explícitas são mais seguras e rápidas.
        const querySelectAluno = `
            SELECT
                id_aluno,
                ra,
                nome,
                sobrenome,
                data_nascimento,
                endereco,
                email,
                celular,
                status_aluno
            FROM aluno
            WHERE status_aluno = TRUE;
        `;

        // Executa a consulta no banco de dados.
        // "await" pausa aqui até o banco responder — isso é programação assíncrona.
        const respostaBD = await database.query(querySelectAluno);

        // ✅ MELHORIA 2: .map() no lugar de forEach + push.
        // .map() transforma cada linha do banco em um AlunoDTO diretamente,
        // sem precisar criar uma lista vazia e ir adicionando item por item.
        // O resultado já é um array pronto — mais limpo e mais eficiente.
        const listaDeAlunos: AlunoDTO[] = respostaBD.rows.map((aluno) => ({
            id_aluno:        aluno.id_aluno,
            ra:              aluno.ra,
            nome:            aluno.nome,
            sobrenome:       aluno.sobrenome,
            data_nascimento: aluno.data_nascimento,
            endereco:        aluno.endereco,
            email:           aluno.email,
            celular:         aluno.celular,
            status_aluno:    aluno.status_aluno,
        }));

        // ✅ MELHORIA 3: Log de sucesso com quantidade de registros retornados.
        // Em produção, isso ajuda a monitorar se a consulta está retornando
        // o que se espera — sem precisar abrir o banco manualmente.
        console.log(`Alunos listados com sucesso. Total: ${listaDeAlunos.length}`);

        return listaDeAlunos;

    } catch (error) {
        // ✅ MELHORIA 4: console.error no lugar de console.log para erros.
        // Erros devem ir para o stream de erro (stderr), não o de saída (stdout).
        // Isso permite que ferramentas de monitoramento os identifiquem corretamente.
        console.error(`Erro ao listar alunos: ${error}`);

        // Retorna null para sinalizar que houve falha.
        // O controller deve sempre verificar se o retorno é null antes de usar.
        return null;
    }
}

    /**
     * Retorna as informações de um aluno informado pelo ID
     * 
     * @param idAluno Identificador único do aluno
     * @returns Objeto com informações do aluno
     */
    // Recebe o ID do aluno como parâmetro e retorna um AlunoDTO ou null
    static async listarAluno(id_aluno: number): Promise<AlunoDTO | null> {
    try {
        const querySelectAluno = `SELECT * FROM aluno WHERE id_aluno = $1`;
        const respostaBD = await database.query(querySelectAluno, [id_aluno]);

        // ✅ Verifica se retornou alguma linha antes de acessar rows[0]
        if (respostaBD.rows.length === 0) {
            return null;
        }

        const alunoDTO: AlunoDTO = {
            id_aluno: respostaBD.rows[0].id_aluno,
            nome: respostaBD.rows[0].nome,
            sobrenome: respostaBD.rows[0].sobrenome,
            data_nascimento: respostaBD.rows[0].data_nascimento,
            endereco: respostaBD.rows[0].endereco,
            email: respostaBD.rows[0].email,
            celular: respostaBD.rows[0].celular,
            ra: respostaBD.rows[0].ra,
            status_aluno: respostaBD.rows[0].status_aluno
        };

        return alunoDTO;
    } catch (error) {
        console.log(`Erro ao realizar a consulta: ${error}`);
        return null;
    }
}
    /**
    * Cadastra um novo aluno no banco de dados
    * @param aluno Objeto Aluno contendo as informações a serem cadastradas
    * @returns Boolean indicando se o cadastro foi bem-sucedido
    */
    // Recebe um objeto Aluno completo e tenta inseri-lo no banco de dados
    static async cadastrarAluno(aluno: Aluno): Promise<boolean> {
        try {
            // Query SQL de inserção — os "$1", "$2"... são placeholders substituídos pelos valores reais
            // "RETURNING id_aluno" faz o banco retornar o ID gerado automaticamente após o INSERT
            const queryInsertAluno = `INSERT INTO Aluno (nome, sobrenome, data_nascimento, endereco, email, celular)
                                            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_aluno;`;

            // Executa a query passando os valores do objeto aluno
            // .toUpperCase() converte texto para maiúsculas; .toLowerCase() converte para minúsculas
            const result = await database.query(queryInsertAluno, [aluno.getNome().toUpperCase(),
            aluno.getSobrenome().toUpperCase(),     // Sobrenome em maiúsculas
            aluno.getDataNascimento(),              // Data de nascimento sem transformação
            aluno.getEndereco().toUpperCase(),      // Endereço em maiúsculas
            aluno.getEmail().toLowerCase(),         // E-mail em minúsculas
            aluno.getCelular()]);                   // Celular sem transformação

            // Verifica se o banco retornou pelo menos uma linha (ou seja, o INSERT funcionou)
            if (result.rows.length > 0) {
                // Exibe no console o ID do aluno recém-cadastrado
                console.log(`Aluno cadastrado com sucesso. ID: ${result.rows[0].id_aluno}`);
                // Retorna true para indicar sucesso
                return true;
            }

            // Se nenhuma linha foi retornada, o cadastro não funcionou — retorna false
            return false;
        } catch (error) {
            // Captura e exibe qualquer erro ocorrido durante o cadastro
            console.error(`Erro ao cadastrar aluno: ${error}`);
            // Retorna false indicando falha
            return false;
        }
    }

    /**
    * Remove um aluno do banco de dados
    * @param id_aluno ID do aluno a ser removido
    * @returns Boolean indicando se a remoção foi bem-sucedida
   */
    // Recebe o ID do aluno e realiza uma "remoção lógica" (não apaga do banco, apenas desativa)
    static async removerAluno(id_aluno: number): Promise<boolean> {
        try {
            // Busca o aluno no banco antes de tentar remover, para verificar se ele existe e está ativo
            const aluno: AlunoDTO | null = await this.listarAluno(id_aluno);

            // Só prossegue se o aluno existir (não for null) E estiver com status ativo (true)
            if (aluno && aluno.status_aluno) {
                // Query que desativa todos os empréstimos relacionados ao aluno
                // Em vez de apagar, usa UPDATE para setar o status como FALSE (remoção lógica)
                const queryDeleteEmprestimoAluno = `UPDATE emprestimo 
                                                    SET status_emprestimo_registro = FALSE
                                                    WHERE id_aluno=$1;`;

                // Executa a desativação dos empréstimos do aluno
                await database.query(queryDeleteEmprestimoAluno, [id_aluno]);

                // Query que desativa o próprio aluno (também uma remoção lógica)
                const queryDeleteAluno = `UPDATE aluno 
                                        SET status_aluno = FALSE
                                        WHERE id_aluno=$1;`;

                // Executa a desativação do aluno e armazena o resultado
                const result = await database.query(queryDeleteAluno, [id_aluno]);

                // "rowCount" indica quantas linhas foram afetadas pelo UPDATE
                // Se for diferente de 0, significa que o aluno foi desativado com sucesso
                return true;
            }

            // Se o aluno não existir ou já estiver inativo, retorna false
            return false;

        } catch (error) {
            // Exibe o erro no console e retorna false em caso de falha
            console.log(`Erro na consulta: ${error}`);
            return false;
        }
    }

    /**
    * Atualiza os dados de um aluno no banco de dados.
    * @param aluno Objeto do tipo Aluno com os novos dados
    * @returns true caso sucesso, false caso erro
    */
    // Recebe um objeto Aluno com os dados atualizados e os salva no banco
  static async atualizarAluno(aluno: Aluno): Promise<boolean> {
    try {
        // ✅ Usando o getter getIdAluno() em vez de acessar o atributo privado diretamente
        const alunoConsulta: AlunoDTO | null = await this.listarAluno(aluno.getIdAluno());

        if (alunoConsulta && alunoConsulta.status_aluno) {
            const queryAtualizarAluno = `
                UPDATE Aluno SET
                    nome = $1,
                    sobrenome = $2,
                    data_nascimento = $3,
                    endereco = $4,
                    celular = $5,
                    email = $6
                WHERE id_aluno = $7
            `;

            const respostaBD = await database.query(queryAtualizarAluno, [
                aluno.getNome().toUpperCase(),
                aluno.getSobrenome().toUpperCase(),
                aluno.getDataNascimento(),
                aluno.getEndereco().toUpperCase(),
                aluno.getCelular(),
                aluno.getEmail().toLowerCase(),
                aluno.getIdAluno() // ✅ getter aqui também
            ]);

            if (respostaBD.rowCount != 0) {
                return true;
            }
        }

        return false;
    } catch (error) {
        console.log(`Erro na consulta: ${error}`);
        return false;
    }
}
}

// Exporta a classe Aluno para que possa ser importada e usada em outros arquivos do projeto
export default Aluno;