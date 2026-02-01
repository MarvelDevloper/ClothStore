const { default: mongoose } = require("mongoose")

const DBconnection=()=>{
    mongoose.connect(process.env.DB_URL).then(()=>{console.log('DB connected')}).catch(()=>{console.log('Db connection Failed')})
}

module.exports=DBconnection