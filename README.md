# Habitree – Habit Tracker

Project developed as part of the Web Programming course.

Habitree is a web application for creating, planning, and tracking habits, featuring a daily progress system, monthly calendar, points (XP), avatars, leaderboard, and a chatbot to support users.

## Project Objective

Develop a functional web application using Vue 3, including state management, routing, consumption of a REST API, integration with a public external API, and implementation of automated tests, according to the requirements of the course assignment.

## Main Features

User registration and authentication
Creation, editing, and deletion of habits
Habit scheduling by frequency (daily, weekly, monthly, yearly)
Habit visualization in a monthly calendar
Daily progress tracking
Points (XP) system for completed habits
Unlockable avatar system
Dashboard with statistics and user leaderboard
Chatbot (HabitBot) with suggestions and motivation
Integration with a public external API
Automated testing with Vitest

## Technologies Used

Vue 3 (Composition API)
Vite
Pinia (state management)
Vue Router
JSON Server (simulated REST API)
Vitest (automated testing)
HTML / CSS / JavaScript
Public external API (Quotable – motivational quotes)

## How to Run the Project

1. Install dependencies
npm install
2. Start the API (JSON Server)
npm run api

The API will be available at:

http://127.0.0.1:3000
3. Start the application
npm run dev

The application will be available at:

http://localhost:5173
Automated Tests

The project includes automated tests using Vitest.

## To run the tests:

npm run test:run

The test files can be found in:

/tests
Public External API

The project integrates a public external API to retrieve motivational quotes, which are used by the HabitBot chatbot.

## Example of usage:

The “Motivate Me” button in HabitBot displays quotes dynamically retrieved from the Quotable API.
Authors
Names: Aristides Paris and Thiago da Luz
Course: Technologies and Information Systems for the Web
Course Unit: Web Programming I
