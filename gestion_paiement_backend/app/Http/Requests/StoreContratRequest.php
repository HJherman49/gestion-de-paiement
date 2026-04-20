<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContratRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type_contrat' => 'required|string|max:100|unique:contrats,type_contrat',
            'duree'        => 'required|string|max:50',   // ex: "12 mois", "24 mois", "CDI", etc.
        ];
    }

    public function messages(): array
    {
        return [
            'type_contrat.unique' => 'Ce type de contrat existe déjà.',
        ];
    }
}