class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    async register(req, res) {
        const { email, password, userType } = req.body;
        try {
            const user = await this.authService.register(email, password, userType);
            res.status(201).json({ message: 'User registered successfully', user });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async login(req, res) {
        const { email, password } = req.body;
        try {
            const user = await this.authService.login(email, password);
            res.status(200).json({ message: 'User logged in successfully', user });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }

    async logout(req, res) {
        try {
            await this.authService.logout();
            res.status(200).json({ message: 'User logged out successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async getUserProfile(req, res) {
        const userId = req.user.id;
        try {
            const profile = await this.authService.getUserProfile(userId);
            res.status(200).json(profile);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default AuthController;