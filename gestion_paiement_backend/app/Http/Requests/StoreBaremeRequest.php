<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBaremeRequest extends FormRequest
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
        $bareme = $this->route('bareme');

        $indiceRule = Rule::unique('baremes', 'Indice');

        if ($bareme) {
            $indiceRule = $indiceRule->ignore($bareme->Id_bareme, 'Id_bareme');
        }

        return [
            'Indice'          => ['required', 'integer', 'min:1', $indiceRule],
            'salaire_base'    => 'required|numeric|min:0',
            'salaire_mensuel' => 'required|numeric|min:0',
            'anciennete'      => 'nullable|integer|min:0',
            'DIF'             => 'nullable|numeric|min:0',
            'rappell'         => 'nullable|numeric|min:0',
        ];
    }
}
