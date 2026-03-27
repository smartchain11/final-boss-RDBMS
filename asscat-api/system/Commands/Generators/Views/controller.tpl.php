<@php

namespace {namespace};

use {useStatement};
use CodeIgniter\HTTP\ResponseInterface;

class {class} extends {extends}
{
<?php if ($type === 'controller'): ?>
    
    public function index()
    {
    }

    
    public function show($id = null)
    {
    }

    
    public function new()
    {
    }

    
    public function create()
    {
    }

    
    public function edit($id = null)
    {
    }

    
    public function update($id = null)
    {
    }

    
    public function delete($id = null)
    {
    }
<?php elseif ($type === 'presenter'): ?>
    
    public function index()
    {
    }

    
    public function show($id = null)
    {
    }

    
    public function new()
    {
    }

    
    public function create()
    {
    }

    
    public function edit($id = null)
    {
    }

    
    public function update($id = null)
    {
    }

    
    public function remove($id = null)
    {
    }

    
    public function delete($id = null)
    {
    }
<?php else: ?>
    public function index()
    {
    }
<?php endif ?>
}
