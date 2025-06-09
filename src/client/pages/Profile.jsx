import React, { Component } from 'react';
import Navbar from '../components/Navbar';
import { isLoggedIn } from '../js/auth.js';

export default class Profile extends Component {
    render() {
        if (!isLoggedIn()) {
            window.location.href = './login'; // Redirect to login page if not logged in
            return null; // Prevent rendering anything
        }

        return (
            <div>
                <Navbar />
            </div>
        );
    }
}