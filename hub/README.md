# João Hub

Página pessoal pensada para ser aberta por QR code ou Google Wallet.

O Hub reúne apresentação, projetos, contactos e um ficheiro vCard. Os conteúdos e links principais ficam em `config.js`; o restante projeto usa apenas HTML, CSS e JavaScript.

O endereço curto `/j/` redireciona para `/hub/` e preserva os parâmetros do URL. Assim, o destino pode mudar sem ser necessário criar outro QR code.

Para testar localmente a consulta à API pública do GitHub, execute um servidor na raiz do repositório:

```bash
python -m http.server 8000
```
