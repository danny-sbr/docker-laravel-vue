<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExampleItemRequest;
use App\Http\Requests\UpdateExampleItemRequest;
use App\Http\Resources\ExampleItemResource;
use App\Models\ExampleItem;

class ExampleItemController extends Controller
{
    public function index()
    {
        $items = ExampleItem::latest()->paginate(15);

        return ExampleItemResource::collection($items);
    }

    public function store(StoreExampleItemRequest $request)
    {
        $item = ExampleItem::create($request->validated());

        return new ExampleItemResource($item);
    }

    public function show(ExampleItem $exampleItem)
    {
        return new ExampleItemResource($exampleItem);
    }

    public function update(UpdateExampleItemRequest $request, ExampleItem $exampleItem)
    {
        $exampleItem->update($request->validated());

        return new ExampleItemResource($exampleItem);
    }

    public function destroy(ExampleItem $exampleItem)
    {
        $exampleItem->delete();

        return response()->noContent();
    }
}
