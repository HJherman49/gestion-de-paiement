<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBanqueRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nom_banque'        => 'required|string|max:150|unique:banques,nom_banque',
            'agence'            => 'required|string|max:100',
            'code_banque'       => 'required|string|max:10|unique:banques,code_banque',
            'code_localite_bnq' => 'required|string|max:10',
        ];
    }
}
