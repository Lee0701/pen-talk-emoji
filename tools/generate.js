
const fs = require('fs').promises
const svg2png = require('convert-svg-to-png')
const {createCanvas, loadImage, registerFont} = require('canvas')

const canvasSize = 128
const emojiPath = './assets/twemoji/assets/svg/'
const fontPath = './assets/un-fonts/UnGungseo.ttf'
const fontFamily = 'UnGungseo'

async function main(args) {
    registerFont(fontPath, {family: fontFamily})
    if(args[0] == '-c') {
        const config = await fs.readFile(args[1], 'utf-8')
        for(const line of config.split('\n')) {
            const [name, background, text] = line.split(',').map((x) => x.trim())
            await generate(name, background, text)
        }
    } else {
        const [name, backgroundPath, text] = args
        await generate(name, backgroundPath, text)
    }
}

async function generate(name, background, text) {
    const canvas = createCanvas(canvasSize, canvasSize)
    const ctx = canvas.getContext('2d')
    if(background) {
        const image = await loadBackground(background)
        ctx.drawImage(image, 0, 0, canvasSize, canvasSize)
    }
    if(text) {
        const fontSize = canvasSize - 8
        ctx.font = `${fontSize}px ${fontFamily}`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 12
        ctx.strokeText(text, canvasSize / 2, canvasSize / 2)
        ctx.fillStyle = 'white'
        ctx.fillText(text, canvasSize / 2, canvasSize / 2)
    }
    fs.writeFile(`./output/${name}.png`, canvas.toBuffer())
}

async function loadBackground(path) {
    if(path.startsWith('@')) {
        const [type, content] = path.split('/')
        const types = {
            '@emoji': async (content) => {
                const decoded = content.codePointAt(0).toString(16).padStart(2, '0').toLowerCase()
                const decodedPath = `${emojiPath}${decoded}.svg`
                try {
                    const stat = await fs.stat(decodedPath)
                    if(stat.isFile) return await loadSvg(decodedPath)
                } catch {
                }
                return await loadSvg(`${emojiPath}${content}.svg`)
            },
        }
        return await types[type](content)
    } else if(path.endsWith('.svg')) {
        return await loadSvg(path)
    } else {
        return await loadImage(path)
    }
}

async function loadSvg(path) {
    const svg = await fs.readFile(path)
    const png = await svg2png.convert(svg, {width: canvasSize, height: canvasSize})
    const image = await loadImage(png)
    return image
}

if(require.main === module) main(process.argv.slice(2))
module.exports = {generate}
