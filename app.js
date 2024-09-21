const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const ejs = require('ejs');
const app = express();

const StoragePool = "/MountPoint/mainDisk/TinyWebFTP/uploadStorage/";

//設置靜態資源路由
app.use(express.static(__dirname + '/public'));

//設置body-parser中間件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//設置存儲文件的位置和文件名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, StoragePool);
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, originalname);
  }
});

const upload = multer({ storage });

//預覽文件的路由
app.get('/preview/:filename', (req, res) => {
  const { filename } = req.params;
  res.sendFile(StoragePool + filename);
});

//上傳文件的路由
app.post('/upload', upload.single('file'), (req, res) => {
  res.redirect('/');
});

//下載文件的路由
app.get('/download/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = `${StoragePool}${filename}`;
  res.download(filePath);
});

//刪除文件的路由
app.get('/delete/:filename', (req, res)=>{
  const { filename } = req.params;
  const filePath = `${StoragePool}${filename}`;
  fs.unlinkSync(filePath);
  res.redirect('/');
});

//渲染頁面的路由
app.get('/', (req, res) => {
  const filesPath = StoragePool;
  const data = fs.readdirSync(filesPath);
  res.render('index', { files: data });
});

//設置模板引擎和模板文件夾位置
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
  
//啟動服務
app.listen(47715, "::", () => {
  console.log('TinyFTPWeb listening on port 47715!');
});
