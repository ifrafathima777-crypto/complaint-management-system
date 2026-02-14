const db = {
    SCHEMA: 'college_complaints_data',

    _getData: () => {
        const data = localStorage.getItem(db.SCHEMA);
        return data ? JSON.parse(data) : { complaints: [], users: [] };
    },

    _saveData: (data) => {
        localStorage.setItem(db.SCHEMA, JSON.stringify(data));
    },

    complaints: {
        add: async (complaint) => {
            const data = db._getData();
            const newComplaint = {
                id: Date.now().toString(),
                ...complaint,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            data.complaints.push(newComplaint);
            db._saveData(data);
            return newComplaint;
        },

        getAll: async () => {
            const data = db._getData();
            return data.complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        },

        update: async (id, updates) => {
            const data = db._getData();
            const index = data.complaints.findIndex(c => c.id === id);
            if (index !== -1) {
                data.complaints[index] = {
                    ...data.complaints[index],
                    ...updates,
                    updatedAt: new Date().toISOString()
                };
                db._saveData(data);
            }
        },

        onSnapshot: (callback) => {
            // Mocking real-time behavior for simpler refactoring
            const check = () => callback(db._getData().complaints.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
            check();
            window.addEventListener('storage', check);
            // Polling fallback if needed for same-tab updates
            const interval = setInterval(check, 2000);
            return () => {
                window.removeEventListener('storage', check);
                clearInterval(interval);
            };
        }
    }
};

window.LocalDB = db;
