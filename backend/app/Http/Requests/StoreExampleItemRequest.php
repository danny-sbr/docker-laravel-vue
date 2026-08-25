<?php

namespace App\Http\Requests;

use App\Models\ExampleItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExampleItemRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:1000',
            'status' => ['required', 'string', Rule::in(ExampleItem::STATUSES)],
        ];
    }
}
