import app from "./app.js";

const PORT = parseInt(
    process.env.PORT || process.env.ADMIN_PORT || "5001",
    10,
);

app.listen(PORT, () => {
    console.log(`Admin API listening on http://localhost:${PORT}`);
});
