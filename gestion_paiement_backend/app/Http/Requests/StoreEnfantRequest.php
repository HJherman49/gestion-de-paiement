<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreEnfantRequest extends FormRequest
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
            'date_de_naissance' => 'required|date',
            'Nb_enf' => 'required|integer|min:0',
            'Nb_enf_inf_15ans' => 'required|integer|min:0',
            'Nb_enf_sup_15ans' => 'required|integer|min:0',
            'Id_agent' => 'required|exists:agents,Id_agent',
        ];
    }
}
