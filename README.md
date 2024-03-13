# CORE

CORE is a versatile React Native application developed with Expo, aimed at revolutionizing the workflow in the transportation industry for both drivers and passengers. It leverages React Navigation for fluid app navigation, Supabase for secure authentication, and a clear distinction between driver and passenger experiences through dedicated dashboards and features.

## Overview

The CORE app utilizes React Native for cross-platform mobile app development, Expo for managing the development workflow, and React Navigation for seamless in-app navigation. Authentication is handled by Supabase, ensuring a secure login and registration process. The app caters to two main user roles - drivers and passengers, each with their own set of features and dashboard views to optimize their experience.

## Features

- **Secure Authentication**: Utilizes Supabase for user authentication, ensuring secure login and registration.
- **Role-based Dashboards**: Users select their role (driver or passenger) post-authentication, leading them to respective dashboards with relevant functionalities.
- **Driver Features**: Drivers have access to a map view for navigation and a personal profile page.
- **Passenger Features**: Passengers can book rides, view their location on a map, and manage their profile.
- **Dynamic Pricing**: Implements a dynamic pricing model based on the time of day, with rates calculated using HERE GEO CODING for precise location tracking.

## Getting Started

### Requirements

- Node.js
- Expo CLI

### Quickstart

1. Clone the repository to your local machine.
2. Navigate to the project directory and run `npm install` to install necessary dependencies.
3. Execute `expo start` to launch the project. Follow the on-screen instructions to open the application on your device or emulator.

### License

Copyright (c) 2024.