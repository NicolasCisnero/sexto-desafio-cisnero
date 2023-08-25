const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 8080;

app.use(express.json());


const productsRouter = express.Router();


productsRouter.get('/', (req, res) => {
  const products = JSON.parse(fs.readFileSync('api/productos.json'));
  const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
  const limitedProducts = limit ? products.slice(0, limit) : products;
  res.json(limitedProducts);
});


productsRouter.get('/:pid', (req, res) => {
  const productId = req.params.pid;
  const products = JSON.parse(fs.readFileSync('api/productos.json'));
  const product = products.find((p) => p.id.toString() === productId);
  if (!product) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }
  res.json(product);
});


productsRouter.post('/', (req, res) => {
  const newProduct = {
    ...req.body,
    id: generateId(),
  };

  const products = JSON.parse(fs.readFileSync('api/productos.json'));
  products.push(newProduct);
  fs.writeFileSync('api/productos.json', JSON.stringify(products));

  res.json(newProduct);
});


productsRouter.put('/:pid', (req, res) => {
  const productId = req.params.pid;
  const products = JSON.parse(fs.readFileSync('api/productos.json'));
  const productIndex = products.findIndex((p) => p.id.toString() === productId);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Producto no encontrado' });
  }

  const updatedProduct = {
    ...products[productIndex],
    ...req.body,
    id: productId,
  };

  products[productIndex] = updatedProduct;
  fs.writeFileSync('api/productos.json', JSON.stringify(products));

  res.json(updatedProduct);
});


productsRouter.delete('/:pid', (req, res) => {
  const productId = req.params.pid;
  const products = JSON.parse(fs.readFileSync('api/productos.json'));
  const updatedProducts = products.filter((p) => p.id.toString() !== productId);
  fs.writeFileSync('api/productos.json', JSON.stringify(updatedProducts));

  res.json({ message: 'Producto eliminado exitosamente' });
});

app.use('/api/products', productsRouter);


const cartsRouter = express.Router();


cartsRouter.post('/', (req, res) => {
  const newCart = {
    ...req.body,
    id: generateId(),
  };

  const carts = JSON.parse(fs.readFileSync('api/carrito.json'));
  carts.push(newCart);
  fs.writeFileSync('api/carrito.json', JSON.stringify(carts));

  res.json(newCart);
});


cartsRouter.get('/:cid', (req, res) => {
  const cartId = req.params.cid;
  const carts = JSON.parse(fs.readFileSync('api/carrito.json'));
  const cart = carts.find((c) => c.id.toString() === cartId);
  if (!cart) {
    return res.status(404).json({ message: 'Carrito no encontrado' });
  }
  res.json(cart.products);
});


cartsRouter.post('/:cid/product/:pid', (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity || 1;

  const carts = JSON.parse(fs.readFileSync('api/carrito.json'));
  const cartIndex = carts.findIndex((c) => c.id.toString() === cartId);
  if (cartIndex === -1) {
    return res.status(404).json({ message: 'Carrito no encontrado' });
  }

  const cart = carts[cartIndex];

  const existingProduct = cart.products.find((p) => p.id.toString() === productId);
  if (existingProduct) {
    existingProduct.quantity += quantity;
  } else {
    cart.products.push({
      id: productId,
      quantity,
    });
  }

  fs.writeFileSync('api/carrito.json', JSON.stringify(carts));

  res.json(cart.products);
});

app.use('/api/carts', cartsRouter);


function generateId() {
  return Date.now().toString();
}

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
