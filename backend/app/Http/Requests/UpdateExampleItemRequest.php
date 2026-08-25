<?php

namespace App\Http\Requests;

use App\Models\ExampleItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateExampleItemRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'status' => ['sometimes', 'required', 'string', Rule::in(ExampleItem::STATUSES)],
        ];
    }
}
