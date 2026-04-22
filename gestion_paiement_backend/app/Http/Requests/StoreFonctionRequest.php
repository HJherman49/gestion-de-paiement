<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreFonctionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nom_fonction'     => 'required|string|max:150',
            'date_fonction'    => 'required|date',
            'date_affectation' => 'required|date',
            'fonction_prime'   => 'nullable|numeric|min:0',
            'num_fonct'        => 'nullable|string|max:50',
            
            
            'Id_direction'     => 'required|exists:directions,Id_Direction',
            'Id_agent'        => 'required|exists:agents,Id_agent',
        ];
    }
}
