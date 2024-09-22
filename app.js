const express = require('express')
const bodyParser = require('body-parser')
const multer = require('multer')
const ejs = require('ejs')
const app = express()

const fs = require('fs')
var zip = require('express-zip');
require('dotenv').config()

const StoragePool = process.env.WebDrive_AnonymousBucket_Path

//設置靜態資源路由
app.use(express.static(__dirname + '/public'))

//設置body-parser中間件
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

//設置存儲文件的位置和文件名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, StoragePool)
  },
  filename: (req, file, cb) => {
    const { originalname } = file
    cb(null, originalname)
  }
})

const upload = multer({ storage })

//預覽文件的路由
app.get('/preview/:filename', (req, res) => {
  const { filename } = req.params
  res.sendFile(StoragePool + filename)
})

//上傳文件的路由
app.post('/upload', upload.array('file'), (req, res) => {
  res.redirect('/')
})

//下載文件的路由
app.get('/download', (req, res) => {
  const { fileArrStr } = req.query
  fileArr = fileArrStr ? JSON.parse(fileArrStr):[]
  
  if(fileArr.length <= 1){
    const filePath = `${StoragePool}${fileArr[0]}`
    res.download(filePath)
  }else{
    let fileObjList = []
    fileArr.forEach((element, index) => {
      const filePath = `${StoragePool}${element}`
      fileObjList.push({
        path: filePath,
        name: element,
      })
    })

    res.zip(fileObjList);
  }
})

//刪除文件的路由
app.get('/delete', (req, res)=>{
  const { fileArrStr } = req.query
  fileArr = fileArrStr ? JSON.parse(fileArrStr):[]
  
  if(fileArr.length <= 1){
    const filePath = `${StoragePool}${fileArr[0]}`
    fs.unlinkSync(filePath)
    res.redirect('/')
  }else{
    fileArr.forEach((element, index) => {
      const filePath = `${StoragePool}${element}`
      fs.unlinkSync(filePath)
    })
    
    res.redirect('/')
  }

})

//渲染頁面的路由
app.get('/', (req, res) => {
  const filesPath = StoragePool
  const data = fs.readdirSync(filesPath)

  res.render('index', {
    files: data
  })
})

//設置模板引擎和模板文件夾位置
app.set('views', __dirname + '/views')
app.set('view engine', 'ejs')

const serverPort = process.env.serverPort
if(!(process.env.useTLS === "true")){
  //啟動服務
  app.listen(serverPort, () => {
    console.log('KiHackerTech listening on port ' + serverPort + '!')
  })

}else{
  let keyPath = process.env.keyPath
  let certPath = process.env.certPath
  let hskey = fs.readFileSync(keyPath)
  let hscert = fs.readFileSync(certPath)

  let TinyWebNAS = https.createServer({
    key: hskey,
    cert: hscert
  }, app)

  // 啟動服務
  TinyWebNAS.listen(serverPort, () => {
    console.log('TinyWebNAS with TLS listening on port ' + serverPort + '!')
  })

}