// Exporta a interface como padrão do arquivo, tornando-a disponível para importação em outros arquivos
// "interface" define um contrato de dados — garante que todo objeto AlunoDTO tenha exatamente esses campos
// Diferente de uma classe, a interface não tem métodos nem lógica, apenas descreve a "forma" dos dados
export default interface AlunoDTO {

    // ID único do aluno no banco de dados
    // O "?" indica que este campo é OPCIONAL — pode estar presente ou não no objeto
    // É opcional pois ao criar um novo aluno, o ID ainda não existe (é gerado pelo banco)
    id_aluno?: number,

    // Registro Acadêmico do aluno
    // Também opcional, pois o RA pode ser gerado automaticamente pelo sistema após o cadastro
    ra?: string,

    // Primeiro nome do aluno — OBRIGATÓRIO (sem "?")
    // Todo objeto AlunoDTO precisa ter este campo preenchido
    nome: string,

    // Sobrenome do aluno — OBRIGATÓRIO
    sobrenome: string,

    // Data de nascimento do aluno — OBRIGATÓRIO
    // Usa o tipo Date do TypeScript para garantir que seja uma data válida
    data_nascimento: Date,

    // Endereço residencial do aluno — OBRIGATÓRIO
    endereco: string,

    // E-mail do aluno — OBRIGATÓRIO
    email: string,

    // Número de celular do aluno — OPCIONAL
    // Pode ser omitido caso o aluno não tenha ou não queira informar
    celular?: string

    // Status do aluno no sistema (true = ativo, false = inativo/removido logicamente)
    // Opcional pois nem sempre é necessário trafegar essa informação
    // Por exemplo, ao cadastrar um novo aluno, o status é definido automaticamente como true pelo banco
    status_aluno?: boolean
}