<?php
class AuthController {
    private $db;

    public function __construct($db) {
        $this->db = $db;
    }

    public function login($data) {
        if (empty($data['username']) || empty($data['password'])) {
            jsonResponse(['error' => 'Username and password are required'], 400);
            return;
        }

        $stmt = $this->db->prepare("SELECT * FROM admin_users WHERE username = :username");
        $stmt->execute([':username' => $data['username']]);
        $user = $stmt->fetch();

        if ($user && password_verify($data['password'], $user['password_hash'])) {
            // Success
            jsonResponse([
                'message' => 'Login successful',
                'username' => $user['username'],
                'role' => 'admin'
            ]);
        } else {
            jsonResponse(['error' => 'Invalid credentials'], 401);
        }
    }

    public function updatePassword($data) {
        if (empty($data['currentPassword']) || empty($data['newPassword'])) {
            jsonResponse(['error' => 'Current and new passwords are required'], 400);
            return;
        }

        // We only have one admin for now, but handle generically
        $stmt = $this->db->prepare("SELECT * FROM admin_users WHERE username = 'admin'");
        $stmt->execute();
        $user = $stmt->fetch();

        if (!$user || !password_verify($data['currentPassword'], $user['password_hash'])) {
            jsonResponse(['error' => 'Incorrect current password'], 403);
            return;
        }

        $newHash = password_hash($data['newPassword'], PASSWORD_BCRYPT);
        $updateStmt = $this->db->prepare("UPDATE admin_users SET password_hash = :hash WHERE id = :id");
        $updateStmt->execute([
            ':hash' => $newHash,
            ':id' => $user['id']
        ]);

        jsonResponse(['message' => 'Password updated successfully']);
    }
}
?>
