# 開発者向け obniz-cli readme
## 環境構築
node: 16
```bash
$ git clone https://github.com/obniz/obniz-cli
$ cd obniz-cli
$ npm install
```

> 注意 electronの場合、インストールしているnodeのバージョンによって、electronの内部的なネイティブモジュールのバージョンが異なってしまうので、
> ```./node_modules/.bin/electron-rebuild```を実行してください。(```npm rebuild```でnode側のバージョンに合わせられます)

### ビルド
```npm run build```

### electron デバッグ
```npm run electron```

### cli デバッグ
```npm run start```

### electron パッケージング

```bash
#win,mac両方
npm run pack
#windowsのみ
npm run pack:win
#macのみ
npm run pack:mac
```

