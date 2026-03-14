// Importa a classe DatabaseModel — usada para testar a conexão com o banco antes de subir o servidor
import { DatabaseModel } from "./model/DatabaseModel.js";
// Importa o servidor Express configurado no server.ts — é ele quem será iniciado após a conexão com o banco
import { server } from "./server.js";
// Importa a biblioteca dotenv — responsável por carregar as variáveis de ambiente do arquivo .env
// Variáveis de ambiente guardam informações sensíveis (senhas, portas, hosts) fora do código-fonte
import dotenv from "dotenv";

// Carrega as variáveis definidas no arquivo .env para dentro do process.env
// Deve ser chamado o mais cedo possível, antes de qualquer leitura de process.env
// Sem esta linha, process.env.PORT e process.env.HOST retornariam undefined
dotenv.config();

/**
 * Configura a porta do servidor web
 */
// Lê a variável PORT do arquivo .env e converte de string para número inteiro
// Ex: se .env tiver PORT=3333, a variável port receberá o número 3333
const port: number = parseInt(process.env.PORT as string);

// Lê a variável HOST do arquivo .env
// O operador "??" garante que, se HOST não estiver definido no .env, usa string vazia como padrão
const host: string = process.env.HOST ?? "";

/**
 * Inicia servidor web para escutar requisições
 */
// Cria uma nova instância do DatabaseModel e chama o método testeConexao()
// testeConexao() é assíncrono — retorna uma Promise que resolve com true (conexão ok) ou false (falha)
// O .then() executa o código dentro dele apenas quando a Promise for resolvida
new DatabaseModel().testeConexao().then((ok) => {

    // Verifica se a conexão com o banco de dados foi bem-sucedida
    if (ok) {
        // Se a conexão funcionou, inicia o servidor Express na porta e host definidos no .env
        // O segundo argumento é uma função callback executada assim que o servidor estiver no ar
        server.listen(port, () => {
            // Exibe no console o endereço completo onde o servidor está rodando
            // console.info é igual ao console.log, mas semanticamente indica uma mensagem informativa
            console.info(`Servidor executando no endereço ${host}:${port}`);
        });
    } else {
        // Se a conexão com o banco falhou, exibe uma mensagem de erro e o servidor NÃO é iniciado
        // console.error exibe a mensagem em vermelho no terminal, indicando que é um erro crítico
        // Isso evita que o servidor suba sem banco de dados — o que causaria erros em todas as rotas
        console.error(`Não foi possível conectar com o banco de dados.`);
    }
})