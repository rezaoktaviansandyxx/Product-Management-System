<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users',
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                'unique:users',
                'regex:/^[\w\.-]+@[\w\.-]+\.\w{2,}$/'
            ],
            'password' => ['required', 'confirmed'],
            'role_name' => 'required|string|exists:roles,name'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $role = Role::where('name', $request->role_name)->first();

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $role->id,
            'is_active' => true
        ]);

        return response()->json([
            'message' => 'User registered successfully!',
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        if (!$user->is_active) {
            return response()->json([
                'message' => 'User account is inactive'
            ], 403);
        }

        $user->last_login_at = now();
        $user->save();

        // Set expiration time (1 days in seconds)
        $expiresIn = 60 * 60 * 24 * 1; // 1 hari dalam detik

        $token = $user->createToken('api-token', ['*'], now()->addSeconds($expiresIn));

        return response()->json([
            'message' => 'Login successfully!',
            'access_token' => $token->plainTextToken,
            'expires_in' => $expiresIn,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
