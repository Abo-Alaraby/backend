const request = require("supertest");
const app = require("../index");  // Path to your Express app
const { signupUser } = require("../APIs/User-Service/auth"); // Adjust the path to your authController
const User = require("../Database/Models/user-model");
const Product = require("../Database/Models/product-model");
const Cart = require("../Database/Models/cart-model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const SECRET_KEY = process.env.SECRET_KEY;
// jest.mock("../Middleware/auth", () => ({
//   authenticate: (req, res, next) => {
//     req.user = { id: "testUserId" }; // Mock user ID
//     next();
//   },
//   authorizeAdmin: (req, res, next) => next(),
// }));

describe("Product API", () => {
  let token; // Store adminToken for use in tests
  let productId; // Store product ID for use in tests
  let cartId; // Store cart ID for use in tests
  let adminToken; // Store admin adminToken for use in tests
  let adminId; // Store admin ID for use in tests
  // Mock signup to get a valid adminToken
  beforeAll(async () => {
    const userPayload = {
      email: "testuser@example.com",
      password: "testpassword123",
      firstName: "Test",
      lastName: "User",
      phone: "1234567890", 
    };

    // Make sure this user does not exist before running the tests
    await User.deleteOne({ email: userPayload.email });

    // Use signupUser function to create a new user and get a token
    const res = await request(app)
      .post("/user/signup")
      .send(userPayload);
    token = res.body.token;

    const resAdmin = await request(app).post("/user/login").send({
        email: "admin@example.com",
        password: "testpassword123",
    });
    
    adminToken = resAdmin.body.token;
  });

  it("should return 400 for missing required fields", async () => {
    const res = await request(app)
      .post("/product/create")
      .set("Authorization", `Bearer ${adminToken}`) // Send adminToken in the header
      .send({ price: 100 }); // Missing required fields like name and stock

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("All required fields must be provided.");
  });

  it("should return 201 when creating a product", async () => {
    const res = await request(app)
      .post("/product/create")
      .set("Authorization", `Bearer ${adminToken}`) // Send adminToken in the header
      .send({
        name: "Test Product",
        description: "Test product description",
        price: Math.floor(Math.random() * 100000) + 1, // Random price between 1 and 1000
        stock: 10,
        image: "http://example.com/product.jpg",
        tags: ["electronics", "gadget"],
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("_id"); // Check that product is created
    productId = res.body._id; // Store product ID for later tests
  });

it("should return 500 when an internal server error occurs during product creation", async () => {
    jest.spyOn(Product.prototype, 'save').mockImplementationOnce(() => {
        throw new Error("Internal Server Error");
    });

    const res = await request(app)
        .post("/product/create")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
            name: "Test Product",
            description: "Test product description",
            price: Math.floor(Math.random() * 10000000) + 1, // Random price between 1 and 100000
            stock: 10,
            image: "http://example.com/product.jpg",
            tags: ["electronics", "gadget"],
        });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Internal Server Error");

    Product.prototype.save.mockRestore(); // Restore original implementation
});

it("should return 200 when viewing a product", async () => {
    const res = await request(app)
        .get(`/product/${productId}`)
        .set("Authorization", `Bearer ${adminToken}`); // Send adminToken in the header

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("_id", productId); // Check that product is returned
});

it("should return 500 when an internal server error occurs during product retrieval", async () => {
    jest.spyOn(Product, 'findById').mockImplementationOnce(() => {
        throw new Error("Internal Server Error");
    });

    const res = await request(app)
        .get(`/product/${productId}`)
        .set("Authorization", `Bearer ${adminToken}`); // Send adminToken in the header

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Internal Server Error");

    Product.findById.mockRestore(); // Restore original implementation
});



  it("should return 200 when getting all products", async () => {
    const res = await request(app)
      .get("/product")
      .set("Authorization", `Bearer ${adminToken}`); // Send adminToken in the header

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0); // Check that products are returned
  });

  it("should return 200 when changing a product", async () => {
    const res = await request(app)
      .patch(`/product/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`) // Send adminToken in the header
      .send({
        name: "Updated Test Product",
        price: 200,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name", "Updated Test Product"); // Check that product is updated
    expect(res.body).toHaveProperty("price", 200); // Check that product is updated
  });

  it("should return 200 when removing a product", async () => {
    const res = await request(app)
      .delete(`/product/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`); // Send adminToken in the header

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Product successfully deleted.");
  });
  
it("should return 500 when an internal server error occurs during product removal", async () => {
    jest.spyOn(Product, 'findByIdAndDelete').mockImplementationOnce(() => {
            throw new Error("Internal Server Error");
    });

    const res = await request(app)
            .delete(`/product/${productId}`)
            .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Internal Server Error");

    Product.findByIdAndDelete.mockRestore(); // Restore original implementation
});


it("should return 400 when search parameter is missing", async () => {
    const res = await request(app)
        .get("/products/search")
        .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Search parameter is required.");
});

it("should return 200 when searching for products by name", async () => {
    const res = await request(app)
        .get("/products/search?name=Test")
        .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
});

it("should return 404 when no matching results are found", async () => {
    const res = await request(app)
        .get("/products/search?name=NonExistentProduct")
        .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("No matching results.");
});

it("should return 500 when an internal server error occurs", async () => {
    jest.spyOn(Product, 'find').mockImplementation(() => {
        throw new Error("Internal Server Error");
    });

    const res = await request(app)
        .get("/products/search?name=Test")
        .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Internal Server Error");

    Product.find.mockRestore(); // Restore original implementation
});

it("should return 500 when an internal server error occurs during product update", async () => {
    jest.spyOn(Product, 'findById').mockResolvedValue({
        _id: productId,
        name: "Test Product",
        description: "Test product description",
        price: 100,
        stock: 10,
        image: "http://example.com/product.jpg",
        tags: ["electronics", "gadget"],
        save: jest.fn().mockImplementation(() => {
            throw new Error("Internal Server Error");
        })
    });

    jest.spyOn(Product.prototype, 'save').mockImplementationOnce(() => {
        throw new Error("Internal Server Error");
    });

    const res = await request(app)
        .patch(`/product/${productId}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
            name: "Updated Test Product",
            price: 200,
        });

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Internal Server Error");

    Product.prototype.save.mockRestore(); // Restore original implementation
});

it("should return 400 for invalid product ID", async () => {
    const res = await request(app)
        .patch("/cart/5500")
        .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid product ID.");
});

it("should return 404 when product is not found", async () => {
    const nonExistentProductId = new mongoose.Types.ObjectId();
    jest.spyOn(Product, 'findById').mockResolvedValue(null);
    const res = await request(app)
        .patch(`/cart/${nonExistentProductId}`)
        .set("Authorization", `Bearer ${token}`);
        
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Product not found.");

});

it("should return 200 when adding a product to a new cart", async () => {
    const product = new Product({
        name: "Test Product",
        description: "Test product description",
        price: 100,
        stock: 10,
        image: "http://example.com/product.jpg",
        tags: ["electronics", "gadget"],
    });
    await product.save();
    jest.spyOn(Product, 'findById').mockResolvedValue(product);
    jest.spyOn(Cart, 'findOne').mockResolvedValue(null);
    const res = await request(app)
        .patch(`/cart/${product._id}`)
        .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0]).toHaveProperty("product", product._id.toString());
    expect(res.body.products[0]).toHaveProperty("quantity", 1);
    expect(res.body).toHaveProperty("total", product.price);
});

it("should return 200 when adding a product to an existing cart", async () => {
    const product = new Product({
        name: "Test Product1",
        description: "Test product description",
        price: 100,
        stock: 10,
        image: "http://example.com/product.jpg",
        tags: ["electronics", "gadget"],
    });
    await product.save();

    const cart = new Cart({
        user: "67684615d8c6cd8483b478bf",
        products: [{ product: product._id, quantity: 1 }],
        total: product.price,
    });
    Cart.deleteMany();
    await cart.save();
    jest.spyOn(Cart, 'findOne').mockResolvedValue(cart);
    jest.spyOn(Product, 'findById').mockResolvedValue(product);
    const res = await request(app)
        .patch(`/cart/${product._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.products.length).toBe(1);
    expect(res.body.products[0]).toHaveProperty("quantity", 2);
    expect(res.body).toHaveProperty("total", product.price * 2);
});

it("should return 500 when an internal server error occurs", async () => {
    jest.spyOn(Cart, 'findOne').mockImplementation(() => {
        throw new Error("Internal Server Error");
    });

    const product = new Product({
        name: "Test Product",
        description: "Test product description",
        price: 100,
        stock: 10,
        image: "http://example.com/product.jpg",
        tags: ["electronics", "gadget"],
    });
    await product.save();

    const res = await request(app)
        .patch(`/cart/${product._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
    expect(res.body.message).toBe("Internal Server Error");

    Cart.findOne.mockRestore(); // Restore original implementation
});
it("should return 200 when updating the quantity of a product in the cart", async () => {
    const product = new Product({
        name: "Test Product",
        description: "Test product description",
        price: 100,
        stock: 10,
        image: "http://example.com/product.jpg",
        tags: ["electronics", "gadget"],
    });
    const product2 = new Product({
        name: "Test Product2",
        description: "Test product description",
        price: 100,
        stock: 10,
        image: "http://example.com/product.jpg",
        tags: ["electronics", "gadget"],
    });
    Product.deleteMany();
    await product.save();

    const cart = new Cart({
        user: "67684615d8c6cd8483b478bf",
        products: [{ product: product._id, quantity: 1 }, { product: product2._id, quantity: 1 }],
        total: product.price+product2.price,
    });
    Cart.deleteMany();
    await cart.save();
    jest.spyOn(Cart, 'findOne').mockResolvedValue(cart);
    jest.spyOn(Product, 'findById').mockResolvedValue(product);
    const res = await request(app)
        .patch(`/cart/${product._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send();

    expect(res.status).toBe(200);
    expect(res.body.products.length).toBe(2);
    expect(res.body.products[0]).toHaveProperty("quantity", 2);
    expect(res.body).toHaveProperty("total", product.price * 2+product2.price);
});

});
