const express = require('express');
const path = require('path');
const app = express();

// client/build の静的ファイルを配信
app.use(express.static(path.join(__dirname, '../client/build')));

// React のルーティング対応
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
