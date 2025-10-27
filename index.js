import express from 'express';
const app = express();


app.get('/', (req, res) => {
    const idade = parseInt(req.query.idade);
    const sexo = req.query.sexo;
    const salarioBase = parseFloat(req.query.salario_base);
    const anoContratacao = parseInt(req.query.anoContratacao);
    const matricula = parseInt(req.query.matricula);

    const erros = [];
    if (isNaN(idade) || idade <= 16) erros.push("Idade deve ser maior que 16.");
    if (!['M', 'F'].includes(sexo)) erros.push("Sexo deve ser 'M' ou 'F'.");
    if (isNaN(salarioBase) || salarioBase <= 0) erros.push("Salário base inválido.");
    if (isNaN(anoContratacao) || anoContratacao <= 1960) erros.push("Ano de contratação inválido.");
    if (isNaN(matricula) || matricula <= 0) erros.push("Matrícula inválida.");

    if (erros.length > 0) {
        return res.send(`<h2>Erros encontrados:</h2><ul>${erros.map(e => `<li>${e}</li>`).join('')}</ul>`);
    }

    const anoAtual = new Date().getFullYear();
    const tempoEmpresa = anoAtual - anoContratacao;

    let faixa = "";
    if (idade >= 18 && idade <= 39) faixa = "18-39";
    else if (idade >= 40 && idade <= 69) faixa = "40-69";
    else if (idade >= 70 && idade <= 99) faixa = "70-99";

    const tabela = {
        "18-39": {
            M: { reajuste: 0.10, desconto: 10, acrescimo: 17 },
            F: { reajuste: 0.10, desconto: 11, acrescimo: 16 }
        },
        "40-69": {
            M: { reajuste: 0.08, desconto: 5, acrescimo: 15 },
            F: { reajuste: 0.08, desconto: 7, acrescimo: 14 }
        },
        "70-99": {
            M: { reajuste: 0.15, desconto: 15, acrescimo: 13 },
            F: { reajuste: 0.17, desconto: 17, acrescimo: 12 }
        }
    };

    const regras = tabela[faixa][sexo];
    const reajuste = salarioBase * regras.reajuste;
    let salarioNovo;
    let obs;

    if (tempoEmpresa <= 10) {
        salarioNovo = salarioBase + reajuste - regras.desconto;
        obs = `Desconto de R$${regras.desconto.toFixed(2)} aplicado (até 10 anos de empresa)`;
    } else {
        salarioNovo = salarioBase + reajuste + regras.acrescimo;
        obs = `Acréscimo de R$${regras.acrescimo.toFixed(2)} aplicado (mais de 10 anos de empresa)`;
    }

    res.send(`
        <h2>Resultado do Reajuste de Salário</h2>
        <p><b>Matrícula:</b> ${matricula}</p>
        <p><b>Idade:</b> ${idade}</p>
        <p><b>Sexo:</b> ${sexo}</p>
        <p><b>Salário base:</b> R$ ${salarioBase.toFixed(2)}</p>
        <p><b>Ano de contratação:</b> ${anoContratacao}</p>
        <p><b>Tempo de empresa:</b> ${tempoEmpresa} anos</p>
        <p><b>Reajuste aplicado:</b> ${(regras.reajuste * 100)}%</p>
        <p><b>${obs}</b></p>
        <p><b>Salário reajustado:</b> <span style="color: green; font-size: 1.5em;">R$ ${salarioNovo.toFixed(2)}</span></p>
        <hr>
        <a href="/">Calcular novamente</a>
    `);
});

app.get('/instrucoes', (req, res) => {
    res.send(`
        <h2>Como utilizar o sistema de reajuste:</h2>
        <p>
            Acesse via navegador: <br>
            <b>http://localhost:3000/?idade=18&sexo=F&salario_base=1700&anoContratacao=2014&matricula=12345</b><br>
            <br>
            Substitua os valores pelos dados do funcionário.
        </p>
        <ul>
            <li>Idade: maior que 16</li>
            <li>Sexo: M ou F</li>
            <li>Salário base: valor real, ex: 1750.80</li>
            <li>Ano de contratação: acima de 1960</li>
            <li>Matrícula: inteiro maior que 0</li>
        </ul>
    `);
});

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000/");
});
