import React, { useState } from 'react';
import { UserIcon, EditIcon, MailIcon } from '../Icons.jsx';
import VerificationStatus from './VerificationStatus.jsx';

const ProfileDetails = ({ user }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ username: user.username, email: user.email });

    const handleEdit = () => {
        if (isEditing) {
            // In a real app, you would call an API to save changes to the backend.
            console.log("Saving data:", formData);
        }
        setIsEditing(!isEditing);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="profile-tab-content">
            <h3>Account Details</h3>
            <div className="details-grid">
                {isEditing ? (
                    <>
                        <div className="input-group full-width">
                            <span className="input-icon"><UserIcon /></span>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder=" "
                                className="profile-input"
                            />
                            <label htmlFor="username">Username</label>
                        </div>
                        <div className="input-group full-width">
                            <span className="input-icon"><MailIcon /></span>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder=" "
                                className="profile-input"
                            />
                            <label htmlFor="email">Email Address</label>
                        </div>
                    </>
                ) : (
                    <>
                        <label>Username</label>
                        <span>{user.username}</span>
                        <label className="email-label">Email Address <VerificationStatus isVerified={user.emailVerified} /></label>
                        <span>{user.email}</span>
                    </>
                )}

            </div>
            <button className="btn-primary" onClick={handleEdit}>
                <EditIcon /> {isEditing ? 'Save Changes' : 'Edit Profile'}
            </button>
        </div>
    );
};

export default ProfileDetails;
