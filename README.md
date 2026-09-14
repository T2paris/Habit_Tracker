# Habitree – Habit Tracker

Projeto desenvolvido no âmbito da unidade curricular **Programação Web**.

O **Habitree** é uma aplicação web para criação, planeamento e acompanhamento de hábitos,
com sistema de progresso diário, calendário mensal, pontos (XP), avatares, ranking e
um chatbot de apoio ao utilizador.

---

## Objetivo do projeto

Desenvolver uma aplicação web funcional utilizando **Vue 3**, com gestão de estado,
rotas, consumo de uma **API REST**, integração de uma **API pública externa** e
implementação de **testes automatizados**, de acordo com o enunciado da unidade curricular.

---

## Funcionalidades principais

- Registo e autenticação de utilizadores
- Criação, edição e remoção de hábitos
- Planeamento de hábitos por frequência (diária, semanal, mensal, anual)
- Visualização de hábitos num **calendário mensal**
- Marcação de progresso diário
- Sistema de pontos (XP) por hábitos concluídos
- Sistema de avatares desbloqueáveis
- Dashboard com estatísticas e ranking de utilizadores
- Chatbot (HabitBot) com sugestões e motivação
- Integração com uma API pública externa
- Testes automatizados com Vitest

---

## Tecnologias utilizadas

- **Vue 3** (Composition API)
- **Vite**
- **Pinia** (gestão de estado)
- **Vue Router**
- **JSON Server** (API REST simulada)
- **Vitest** (testes automatizados)
- **HTML / CSS / JavaScript**
- **API pública externa** (Quotable – frases motivacionais)

---

## Como executar o projeto

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar a API (JSON Server)
```bash
npm run api
```

A API ficará disponível em:
```
http://127.0.0.1:3000
```

### 3. Iniciar a aplicação
```bash
npm run dev
```

A aplicação ficará disponível em:
```
http://localhost:5173
```

---

## Testes automatizados

O projeto inclui testes automatizados utilizando **Vitest**.

Para executar os testes:
```bash
npm run test:run
```

Os ficheiros de teste encontram-se na pasta:
```
/tests
```

---

## API pública externa

O projeto integra uma **API pública externa** para obtenção de frases motivacionais,
utilizada pelo chatbot **HabitBot**.

Exemplo de utilização:
- Botão **“Motiva-me”** no HabitBot, que apresenta frases obtidas dinamicamente
  a partir da API Quotable.

---

## Autores

- **Nome:** Aristides Paris e Thiago da Luz
- **Curso:** Tecnologias e Sistemas de Informação para a Web  
- **Unidade Curricular:** Programação Web I  
