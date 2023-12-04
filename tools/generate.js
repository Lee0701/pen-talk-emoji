
const fs = require('fs').promises
const svg2png = require('convert-svg-to-png')
const {createCanvas, loadImage, registerFont} = require('canvas')

const canvasSize = 128
const fontPath = './assets/un-fonts/UnGungseo.ttf'
const fontFamily = 'UnGungseo'

async function main(args) {
    registerFont(fontPath, {family: fontFamily})
    if(args[0] == '-c') {
        const config = await fs.readFile(args[1], 'utf-8')
        for(const line of config.split('\n')) {
            const [name, backgroundPath, text] = line.split(',').map((x) => x.trim())
            await generate(name, backgroundPath, text)
        }
    } else {
        const [name, backgroundPath, text] = args
        await generate(name, backgroundPath, text)
    }
}

async function generate(name, backgroundPath, text) {
    const canvas = createCanvas(canvasSize, canvasSize)
    const ctx = canvas.getContext('2d')
    if(backgroundPath) {
        const image = await loadSvg(backgroundPath)
        ctx.drawImage(image, 0, 0, canvasSize, canvasSize)
    }
    if(text) {
        const fontSize = canvasSize - 8
        ctx.font = `${fontSize}px ${fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 16
        ctx.strokeText(text, canvasSize / 2, canvasSize / 2)
        ctx.fillStyle = 'white'
        ctx.fillText(text, canvasSize / 2, canvasSize / 2)
    }
    fs.writeFile(`./output/${name}.png`, canvas.toBuffer())
}

async function loadSvg(path) {
    const svg = await fs.readFile(path)
    const png = await svg2png.convert(svg, {width: canvasSize, height: canvasSize})
    const image = await loadImage(png)
    return image
}

if(require.main === module) main(process.argv.slice(2))
module.exports = {generate}
