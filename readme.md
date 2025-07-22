# Stock - Sistema de Gerenciamento de Estoque
Este é um projeto de sistema de gerenciamento de estoque desenvolvido com Python e Django.

# 📋 Visão Geral
O Stock é uma aplicação web que permite gerenciar produtos, categorias, fornecedores e movimentações de estoque de forma simples e eficiente.

## ✨ Funcionalidades

✔ Produtos

Cadastro, edição e exclusão de produtos

Atributos como nome, descrição, preço, quantidade em estoque, etc.

✔ Categorias

Organização dos produtos por categorias

✔ Fornecedores

Cadastro de fornecedores com informações de contato

✔ Movimentações

Registro de entradas e saídas de produtos

Histórico completo das transações

✔ Relatórios

Geração de relatórios de estoque

## 🛠 Tecnologias Utilizadas
Backend: Python + Django

Frontend: HTML, CSS, Bootstrap

Banco de Dados: SQLite (padrão)

## ⚙️ Como Executar o Projeto
Clone o repositório
```bash
git clone https://github.com/TRogato/stock.git
cd stock
Crie e ative um ambiente virtual (opcional)
````
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
Instale as dependências
````
```bash
pip install -r requirements.txt
Execute as migrações
````
```bash
python manage.py migrate
Crie um superusuário (opcional)
````
```bash

python manage.py createsuperuser
Inicie o servidor
````
```bash
python manage.py runserver
Acesse a aplicação
Abra o navegador em: http://127.0.0.1:8000
````

## 📝Licença

Este repositório está sob a licença [MIT](https://github.com/TRogato/Trogato/blob/main/LICENSE). Por favor, consulte o arquivo `LICENSE` para mais detalhes.

## 🤝 Contribuição
Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

Desenvolvido por Thiago Rogato
