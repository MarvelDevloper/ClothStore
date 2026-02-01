const Redis = require("ioredis");

const redis = new Redis({
    host:'localhost',
    port:6379
});


redis.on('connect',()=>{
    console.log('Redis connected')
})


redis.on('error',()=>{
    console.log('Redis Faild to Connect')
})

module.exports=redis