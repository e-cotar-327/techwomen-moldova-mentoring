// netlify/functions/update-profiles.js
// Netlify Function to update JSON files when profiles are approved

const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            },
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            },
        };
    }

    try {
        // Parse request body
        const { profile, role, action = 'add' } = JSON.parse(event.body);

        // Validate input
        if (!profile || !role) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                    error: 'Profile and role are required',
                }),
            };
        }

        if (!['mentor', 'mentee'].includes(role)) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({
                    error: 'Role must be mentor or mentee',
                }),
            };
        }

        // Determine file path
        const fileName = role === 'mentor' ? 'mentors.json' : 'mentees.json';
        const filePath = path.join(process.cwd(), 'public', 'data', fileName);

        // Read existing data
        let existingData = [];
        try {
            const fileContent = await fs.readFile(filePath, 'utf8');
            existingData = JSON.parse(fileContent);
        } catch (error) {
            console.log(`Creating new ${fileName} file`);
            existingData = [];
        }

        // Perform the requested action
        let result;
        switch (action) {
            case 'add':
                result = await addProfile(existingData, profile, filePath);
                break;
            case 'update':
                result = await updateProfile(existingData, profile, filePath);
                break;
            case 'delete':
                result = await deleteProfile(
                    existingData,
                    profile.id,
                    filePath
                );
                break;
            default:
                throw new Error(`Unsupported action: ${action}`);
        }

        return {
            statusCode: 200,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify(result),
        };
    } catch (error) {
        console.error('Error updating profiles:', error);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({
                error: 'Internal server error',
                details: error.message,
            }),
        };
    }
};

// Add new profile
async function addProfile(existingData, profile, filePath) {
    // Check for duplicates by email
    const isDuplicate = existingData.some(
        (item) => item.email === profile.email
    );
    if (isDuplicate) {
        throw new Error('Profile with this email already exists');
    }

    // Ensure profile has required fields
    const sanitizedProfile = {
        id:
            profile.id ||
            `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: profile.name || '',
        title: profile.title || '',
        company: profile.company || '',
        year: profile.year || new Date().getFullYear().toString(),
        domain: profile.domain || '',
        linkedin: profile.linkedin || '',
        email: profile.email || '',
        bio: profile.bio || '',
        story: profile.story || '', // for mentees
        mentor: profile.mentor || '', // for mentees
        image:
            profile.image || '/assets/images/defaults/profile-placeholder.jpg',
        status: profile.status || 'approved',
        dateAdded: profile.dateAdded || new Date().toISOString().split('T')[0],
        dateUpdated: new Date().toISOString().split('T')[0],
    };

    // Add to existing data
    existingData.push(sanitizedProfile);

    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));

    // Log the addition
    console.log(`Added ${sanitizedProfile.name} to ${filePath}`);

    return {
        success: true,
        message: 'Profile added successfully',
        profile: sanitizedProfile,
        totalProfiles: existingData.length,
    };
}

// Update existing profile
async function updateProfile(existingData, profile, filePath) {
    const index = existingData.findIndex((item) => item.id === profile.id);

    if (index === -1) {
        throw new Error('Profile not found');
    }

    // Update the profile while preserving original creation date
    const updatedProfile = {
        ...existingData[index],
        ...profile,
        dateUpdated: new Date().toISOString().split('T')[0],
    };

    existingData[index] = updatedProfile;

    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));

    console.log(`Updated profile ${updatedProfile.name} in ${filePath}`);

    return {
        success: true,
        message: 'Profile updated successfully',
        profile: updatedProfile,
    };
}

// Delete profile
async function deleteProfile(existingData, profileId, filePath) {
    const index = existingData.findIndex((item) => item.id === profileId);

    if (index === -1) {
        throw new Error('Profile not found');
    }

    const deletedProfile = existingData.splice(index, 1)[0];

    // Write back to file
    await fs.writeFile(filePath, JSON.stringify(existingData, null, 2));

    console.log(`Deleted profile ${deletedProfile.name} from ${filePath}`);

    return {
        success: true,
        message: 'Profile deleted successfully',
        deletedProfile: deletedProfile,
        totalProfiles: existingData.length,
    };
}
