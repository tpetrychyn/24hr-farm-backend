const express = require('express')
const HTML5ToPDF = require('html5-to-pdf')
const fs = require('fs')
const path = require('path')
// const jsonfile = require('jsonfile')

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

// const dataFile = path.join(__dirname, "data", "data.json")

const responses = []

function buildPdf() {
    // load html template into string
    var template = fs.readFileSync(path.join(__dirname, "assets", "template.html"), 'utf8')

    // get average of a data point
    const lentilAverage = responses.reduce((lentilTotal, response) => lentilTotal + response.lentilPrice, 0) / responses.length

    // replace the templateString in the html template with the actual value
    template = template.replace('{{lentilAverage}}', lentilAverage)

    const html5ToPDF = new HTML5ToPDF({
        inputBody: template,
        outputPath: path.join(__dirname, "output.pdf"),
        include: [
            path.join(__dirname, "assets", "dashboard.css"),
            path.join(__dirname, "assets", "bootstrap.min.css"),
        ],
    })

    // sorry about promise hell
    return html5ToPDF.start().then(() => {
        return html5ToPDF.build().then(() => {
            return html5ToPDF.close()
        })
    })
}

app.get('/farms', (req, res) => {
    // Can do filtering, averaging on frontend
    res.send(responses)
})

app.get('/report', (req, res) => {
    // jsonfile.readFile(dataFile).then(res => {
    //     const data = res
    // }).catch(error => { throw error})
    
    buildPdf().then(() => {
        const data = fs.readFileSync(path.join(__dirname, "output.pdf"));
        res.contentType("application/pdf");
        res.send(data);
    }).catch(err => res.send(`failed to generate pdf: ${error}`));
})

app.post('/submit', (req, res) => {
    const farmInput = req.body
    responses.push(farmInput)
    res.sendStatus(201)

    // jsonfile.writeFile(dataFile, farmInput)
    //     .then(() => {
    //         res.sendStatus(201)
    //     })
    //     .catch(error => res.send(`failed to save input ${error}`))
})

const port = 3000
app.listen(port, () => console.log(`Example app listening on port ${port}!`))