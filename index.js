const port = 8000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://server-api:server12345@cluster0.5iay7wi.mongodb.net/your-database-name?retryWrites=true&w=majority");

app.get("/", (req, res) => {
    res.send("Express App is running");
});

const storage = multer.diskStorage({
    destination: './',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

const Users = mongoose.model('Users', {
    name: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    cartData: {
        type: Object,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

app.post('/signup', async (req, res) => {
    try {
        let check = await Users.findOne({ email: req.body.email });

        if (check) {
            return res.status(400).json({ success: false, errors: "Người dùng đã tồn tại." });
        }

        let cart = {};
        for (let i = 0; i < 300; i++) {
            cart[i] = 0;
        }

        const user = new Users({
            name: req.body.username,
            email: req.body.email,
            password: req.body.password,
            cartData: cart,
        });

        await user.save();

        const data = {
            user: {
                id: user.id
            }
        };

        const token = jwt.sign(data, 'secret_ecom');
        res.json({ success: true, token });
    } catch (error) {
        console.error('Lỗi trong quá trình đăng ký:', error);
        res.status(500).json({ success: false, errors: 'Lỗi máy chủ nội bộ' });
    }
});

app.post('/login', async (req, res) => {
    try {
        let user = await Users.findOne({ email: req.body.email });

        if (user) {
            const passCompare = req.body.password === user.password;

            if (passCompare) {
                const data = {
                    user: {
                        id: user.id
                    }
                };

                const token = jwt.sign(data, 'secret_ecom');
                res.json({ success: true, token });
            } else {
                res.json({ success: false, errors: "Sai mật khẩu" });
            }
        } else {
            res.json({ success: false, errors: "Sai địa chỉ email" });
        }
    } catch (error) {
        console.error('Lỗi trong quá trình đăng nhập:', error);
        res.status(500).json({ success: false, errors: 'Lỗi máy chủ nội bộ' });
    }
});

app.listen(port, (error) => {
    if (!error) {
        console.log("Express đang chạy trên cổng " + port);
    } else {
        console.log("Lỗi: " + error);
    }
});