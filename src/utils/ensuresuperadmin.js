const mongoose = require('mongoose');
const Admin = require('../models/adminschema');

async function ensureSuperAdmin() {
    try {
        // Check if super admin already exists
        const existingAdmin = await Admin.findOne({ email: process.env.SUPER_ADMIN });
        if (existingAdmin) {
            console.log('Super admin already exists');
            return;
        }

        // Create super admin
        const superAdmin = await Admin.create({
            fullName: "Hari Narayanan",
            email: process.env.SUPER_ADMIN,
            password: process.env.SUPER_ADMIN_PASSWORD,
            role: "super_admin",  
             isActive:true             
        });

        console.log('Super admin created:', superAdmin.email);
    } catch (err) {
        console.error('Error creating super admin:', err);
    }
}

module.exports ={ensureSuperAdmin}