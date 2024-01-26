$(document).ready(function () {
    loadApp()
})

function loadApp() {
    if (chkLocalStorage()) {
        let myJson = JSON.parse(chkLocalStorage())
        $('#myLimit').html(moeda(myJson['Meu Limite']))
        $('#buyValue').html(moeda(myJson['Compra']))
        $('#changeValue').html(moeda(myJson['Saldo']))
        if (myJson['Lista']) {
            loadList(myJson)
        } else {
            $('.box').html('')
        }
    } else {
        let init = ['Meu Limite', 'Compra', 'Saldo']
        const listObj = new Object();
        for (i = 0; i < init.length; i++) {
            listObj[init[i]] = 0
        }
        localStorage.setItem('lista', JSON.stringify(listObj))
        $('#myLimit').html(moeda(listObj['Meu Limite']))
        $('#buyValue').html(moeda(listObj['Compra']))
        $('#changeValue').html(moeda(listObj['Saldo']))
        $('.box').html('')
    }
}

function expandUP() {
    if ($('.top span').val() == 0) {
        $('.top button').html('expand_less')
        $('.opts').toggleClass('some')
        $('.top span').val('1')
    } else {
        $('.top button').html('expand_more')
        $('.opts').toggleClass('some')
        $('.top span').val('0')
    }
}

function moeda(param) {
    return param.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })
}



function addLimit() {
    $('.msgBox').toggleClass('some')
}

function addName() {
    $('.msgBoxName').toggleClass('some')
}

function confirmLimit() {
    if ($(`#limitMoney`).val() != '') {
        updateLocalStorage('Meu Limite', parseFloat($(`#limitMoney`).val()))
        $('.msgBox').toggleClass('some')
        $('.opts').toggleClass('some')
        $(`#limitMoney`).val('')
        loadApp()
    } else {
        updateLocalStorage('Meu Limite', 0)
        updateLocalStorage('Saldo', 0)
        $('.msgBox').toggleClass('some')
        $('.opts').toggleClass('some')
        $(`#limitMoney`).val('')
        loadApp()
    }
}

function confirmName() {
    if ($(`#nameLocal`).val() != '') {
        updateLocalStorage('Local', $(`#nameLocal`).val())
        $('.msgBoxName').toggleClass('some')
        $('.opts').toggleClass('some')
        $(`#nameLocal`).val('')
        gerarPDF()
    } else {
        updateLocalStorage('Local', 'Não Informado')
        $('.msgBoxName').toggleClass('some')
        $('.opts').toggleClass('some')
        $(`#nameLocal`).val('')
        gerarPDF()
    }
}

function removeLimit() {
    updateLocalStorage('Meu Limite', 0)
    updateLocalStorage('Saldo', 0)
    $('.opts').toggleClass('some')
    loadApp()
}

function limpar() {
    let opt = confirm('Excluir Lista de Compras?')
    if (opt) {
        localStorage.clear()
        loadApp()
    }
}

function addItem() {
    let produto = $('#item').val()
    let qtde = $('#qtde').val()
    let valor = $('#valor').val()
    const itemList = new Object();
    if (qtde == '' || qtde <= 0 || valor == '' || valor <= 0) {
        alert('Campos Quantidade e Valor não pode ser 0 ou Vazio!')
    } else {
        const total = parseFloat(qtde) * parseFloat(valor)
        itemList['Produto'] = produto
        itemList['Qtde'] = qtde
        itemList['Valor'] = valor
        itemList['Total'] = total
        shoppingList(itemList)
        $('#item').val('')
        $('#qtde').val(1)
        $('#valor').val('')
        loadApp()
    }
}

function removeItem(id) {
    let currentLS = JSON.parse(localStorage.getItem('lista'))
    let opt = confirm(`Excluir item: (${currentLS['Lista'][id].Produto}) da Lista?`)
    if (opt) {
        currentLS['Lista'].splice(id, 1)
        localStorage.setItem('lista', JSON.stringify(currentLS))
        loadApp()
    }
}

function loadList(jsonLs) {
    let soma = 0;
    var ul = '<ul />'
    for (i = 0; i < jsonLs['Lista'].length; i++) {
        soma = soma + jsonLs['Lista'][i].Total
        var li = '<li / >'
        var item = `
        <span>${jsonLs['Lista'][i].Produto}</span>
        <span>${jsonLs['Lista'][i].Qtde} x ${parseFloat(jsonLs['Lista'][i].Valor).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</span>
        <span>${parseFloat(jsonLs['Lista'][i].Total).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</span>
        <button class="material-symbols-outlined" onclick="removeItem(${i})">delete</button>
        `
        li += item
        ul += li
    }
    $('.box').html(ul)

    if (jsonLs['Meu Limite'] != 0) {
        let change = jsonLs['Meu Limite'] - soma
        $('#changeValue').html(moeda(change))
        updateLocalStorage('Compra', soma)
        updateLocalStorage('Saldo', change)
    }
    $('#buyValue').html(moeda(soma))
}

function chkLocalStorage() {
    if (localStorage.getItem('lista')) {
        return localStorage.getItem('lista');
    } else {
        return false;
    }
}

function createObject(name, value) {
    const listObj = new Object();
    listObj[name] = value
    return listObj
}

function updateLocalStorage(item, value) {
    let currentLS = JSON.parse(localStorage.getItem('lista'))
    currentLS[item] = value
    localStorage.setItem('lista', JSON.stringify(currentLS))
}

function shoppingList(item) {
    let currentSL = JSON.parse(localStorage.getItem('lista'))
    if (currentSL['Lista']) {
        currentSL['Lista'].push(item)
        localStorage.setItem('lista', JSON.stringify(currentSL))
    } else {
        currentSL['Lista'] = []
        currentSL['Lista'].push(item)
        localStorage.setItem('lista', JSON.stringify(currentSL))
    }
}

function gerarPDF() {
    if (loadListSimple()) {
        const itens = loadListSimple()
        let dataAtt = new Date()
        console.log(dataAtt.toLocaleDateString('pt-BR'))
        const imprimir = `
    <!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Impressão</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            color: Black;
        }

        body {
            margin: 0 auto;
            padding: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        h2 {
            width: 750px;
            text-align: center;
            margin: 10px 0;
        }

        ul {
            list-style: none;
            margin: 0 10px;
        }

        ul li {
            width: 750px;
            display: flex;
        }

        ul li span {
            width: 250px;
            border: 1px solid black;
            padding: 3px;
        }

        ul li span:nth-child(1) {
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: left;
        }

        ul li span:nth-child(2) {
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        ul li span:nth-child(3) {
            text-align: right;
            display: flex;
            align-items: center;
            justify-content: right;
        }
    </style>
</head>

<body>
    <h2>Lista de Compras (${dataAtt.toLocaleDateString('pt-BR')})</h2>

    <ul style="font-weight: bold; font-size: 18px;">
        <li>
            <span>Produto</span>
            <span>Qtde x Valor</span>
            <span>Total</span>
        </li>
    </ul>

    ${itens[0]}

    <ul>
        <li style="display: flex; justify-content: right; font-weight: bold; padding: 5px;">Total: ${itens[1]}</li>
        <li style="display: flex; justify-content: right; font-weight: bold; padding: 5px;">Local da Compra: ${itens[2]}</li>
        <p style="display: flex; justify-content: center; font-weight: bold; padding: 5px;">Desenvolvido por: <b> Aderaldo Anderson S.V Amorim</b></p>
    </ul>
</body>

</html>`

        // Configuração para o html2pdf
        const options = {
            margin: 0,
            filename: 'documento.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'cm', format: 'A4', orientation: 'portrait' }
        };

        // Gera o PDF usando html2pdf
        html2pdf()
            .from(imprimir)
            .set(options)
            .save();

        console.log(imprimir)
    }
}

function loadListSimple() {
    let returSimple = []
    let jsonLs = JSON.parse(chkLocalStorage())
    if (jsonLs['Lista']) {
        let soma = 0;
        var ul = '<ul>'
        for (i = 0; i < jsonLs['Lista'].length; i++) {
            soma = soma + jsonLs['Lista'][i].Total
            var li = '<li>'
            var item = `
            <span>${jsonLs['Lista'][i].Produto}</span>
            <span>${jsonLs['Lista'][i].Qtde} x ${parseFloat(jsonLs['Lista'][i].Valor).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</span>
            <span>${parseFloat(jsonLs['Lista'][i].Total).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</span>
            `
            li += item
            li += '</li>'
            ul += li
        }
        ul += '</ul>'
        returSimple.push(ul)
        returSimple.push(moeda(soma))
        returSimple.push(jsonLs['Local'])
        return returSimple
    } else {
        alert('Nenhum item na Lista')
        return false;
    }
}
