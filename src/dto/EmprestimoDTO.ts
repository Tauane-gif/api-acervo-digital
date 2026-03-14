// Exporta a interface como padrão do arquivo, tornando-a disponível para importação em outros arquivos
// Esta interface é mais complexa que AlunoDTO pois contém objetos aninhados (aluno e livro dentro do empréstimo)
export default interface EmprestimoDTO {

    // ID único do empréstimo no banco de dados — OBRIGATÓRIO
    // Diferente do AlunoDTO, aqui o id não é opcional — todo EmprestimoDTO precisa ter um ID
    id_emprestimo: number,

    // Objeto aninhado que representa o aluno vinculado ao empréstimo — OBRIGATÓRIO
    // Em vez de importar e reutilizar o AlunoDTO, os dados do aluno foram declarados inline aqui
    // Isso é uma escolha de design: o EmprestimoDTO carrega apenas os dados de aluno que fazem sentido no contexto do empréstimo
    aluno: {
        // ID do aluno — OBRIGATÓRIO dentro do objeto aluno
        // É o único campo obrigatório pois é a chave que liga o empréstimo ao aluno no banco
        id_aluno: number,

        // Os campos abaixo são todos OPCIONAIS — podem ou não estar presentes dependendo do contexto
        // Por exemplo, numa listagem resumida pode-se trazer só o nome; numa detalhada, todos os campos

        // Primeiro nome do aluno
        nome?: string,
        // Sobrenome do aluno
        sobrenome?: string,
        // Data de nascimento do aluno
        data_nascimento?: Date,
        // Endereço do aluno
        endereco?: string,
        // E-mail do aluno
        email?: string,
        // Celular do aluno
        celular?: string,
        // Registro Acadêmico do aluno
        ra?: string,
        // Status do aluno no sistema (true = ativo, false = inativo)
        status_aluno?: boolean
    },

    // Objeto aninhado que representa o livro vinculado ao empréstimo — OBRIGATÓRIO
    // Assim como o objeto aluno acima, os dados do livro foram declarados inline
    livro: {
        // ID do livro — OBRIGATÓRIO dentro do objeto livro
        // É o único campo obrigatório pois é a chave que liga o empréstimo ao livro no banco
        id_livro: number,

        // Os campos abaixo são todos OPCIONAIS — trazidos conforme a necessidade da tela ou operação

        // Título do livro
        titulo?: string,
        // Nome do autor do livro
        autor?: string,
        // Nome da editora do livro
        editora?: string,
        // Ano em que o livro foi publicado
        ano_publicacao?: string,
        // Código ISBN — identificador único internacional de livros
        isbn?: string,
        // Quantidade total de exemplares no acervo
        quant_total?: number,
        // Quantidade de exemplares disponíveis para empréstimo
        quant_disponivel?: number,
        // Quantidade de exemplares adquiridos
        quant_aquisicao?: number,
        // Valor pago para adquirir o livro
        valor_aquisicao?: number,
        // Indica se o livro está disponível ou emprestado (ex: "Disponível", "Emprestado")
        status_livro_emprestado?: string;
        // Status do livro no sistema (true = ativo, false = removido logicamente)
        status_livro?: boolean
    },

    // Data em que o empréstimo foi realizado — OBRIGATÓRIO
    // Todo empréstimo precisa ter uma data de início registrada
    data_emprestimo: Date,

    // Data prevista para devolução do livro — OPCIONAL
    // Pode ser omitida em certas operações, já que o sistema calcula automaticamente (empréstimo + 7 dias)
    data_devolucao?: Date,

    // Situação atual do empréstimo — OPCIONAL
    // Exemplos de valores: "Em Andamento", "Devolvido", "Atrasado"
    // Opcional pois ao criar um empréstimo, o status é definido automaticamente como "Em Andamento"
    status_emprestimo?: string,

    // Indica se o registro do empréstimo está ativo no sistema (true) ou removido logicamente (false) — OPCIONAL
    // Assim como o status_aluno e status_livro, controla a visibilidade do registro sem apagar do banco
    status_emprestimo_registro?: boolean
}