const { PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3")
const { asyncHandler, ApiError } = require("../middleware/errorHandler")
const Product = require("../model/productModel")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")
const s3client = require("../awsConfig/s3Client")

const productController = {
    addProduct: asyncHandler(async (req, res) => {
        const { title, price, brand, color, discount, category, description, images, sizes } = req.body

        if (!title || !price || !color || !category || !brand || !description || !images || !sizes) {
            throw new ApiError('all fields required', 400)
        }

        const existProduct = await Product.findOne({ title: title, brand: brand })

        if (existProduct) {
            throw new ApiError('product already exist', 400)
        }

        const product = new Product({
            title, price, brand, description, category, color, discount: discount || 0, images, sizes
        })

        await product.save()

        return res.status(200).json({ success: true, msg: 'product added successfully' })
    }),
    updateProduct: asyncHandler(async (req, res) => {
        const productId = req.params.productId
        const existProduct = await Product.findById(productId)
        const updateProduct = await Product.findByIdAndUpdate(productId, req.body, { new: true })

        if (!existProduct) {
            throw new ApiError('product not found!', 400)
        }

        if (!updateProduct) {
            throw new ApiError('failed to update the product', 400)
        }

        return res.status(200).json({ success: true, msg: 'product successfull updated', product: existProduct })
    }),
    putObject: asyncHandler(async (req, res) => {
        const { files } = req.body

        if (!files || files.length === 0) {
            throw new ApiError('please provide atleast one file', 400)
        }

        const urls = await Promise.all(files.map(async (file) => {
            const key = `ulpoads/images/${Date.now() + "_" + file.fileName}`
            const command = new PutObjectCommand({
                Bucket: 'marvel-cloth-bucket-m',
                Key: key,
                ContentType: file.contentType
            })

            const url = await getSignedUrl(s3client, command)

            return { url, key }
        }))
        return res.status(200).json({ success: true, urls })
    }),
    getObject: asyncHandler(async (req, res) => {
        const page = req.query.page || 1
        const limit = req.query.limit || 5
        const skip = (page - 1) * limit

        const sortOption = {}

        if (req.query.sort) {
            const sortOrder = (req.query.sort.startsWith('-') ? -1 : 1)
            const sortField = (req.query.sort.startsWith('-') ? req.query.sort.substring(1) : req.query.sort)

            sortOption[sortField] = sortOrder
        }
        const products = await Product.find({}).sort(sortOption).skip(skip).limit(limit)

        if (!products || products.length === 0) {
            throw new ApiError('No products found', 404)
        }

        const productwithImage = await Promise.all(products.map(async (product) => {
            const productImageUrl = await Promise.all(product.images.map(async (key) => {
                const command = new GetObjectCommand({
                    Bucket: 'marvel-cloth-bucket-m',
                    Key: key.key
                })
                const url = await getSignedUrl(s3client, command)

                return url
            }))
            return {
                id: product.id,
                title: product.title,
                price: product.price,
                brand: product.brand,
                category: product.category,
                description: product.description,
                sizes: product.sizes,
                images: productImageUrl
            }
        }))


        return res.status(200).json({ success: true, productwithImage })
    }),
    deleteProduct: asyncHandler(async (req, res) => {
        const productId = req.params.productId

        const existProduct = await Product.findById(productId)

        if (!existProduct) {
            throw new ApiError('product not found!', 400)
        }

        if (!productId) {
            throw new ApiError('productID not found!', 400)
        }

        const deleteProduct = await Product.findByIdAndDelete(productId)

        if (!deleteProduct) {
            throw new ApiError('failed to delete the product', 400)
        }
        return res.status(200).json({ success: true, msg: 'product deleted successfully' })
    })
}


module.exports = productController