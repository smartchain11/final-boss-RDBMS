<@php

namespace {namespace};

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;
<?php if ($type === 'generator'): ?>
use CodeIgniter\CLI\GeneratorTrait;
<?php endif ?>

class {class} extends BaseCommand
{
<?php if ($type === 'generator'): ?>
    use GeneratorTrait;

<?php endif ?>
    
    protected $group = '{group}';

    
    protected $name = '{command}';

    
    protected $description = '';

    
    protected $usage = '{command} [arguments] [options]';

    
    protected $arguments = [];

    
    protected $options = [];

    
    public function run(array $params)
    {
<?php if ($type === 'generator'): ?>
        $this->component = 'Command';
        $this->directory = 'Commands';
        $this->template  = 'command.tpl.php';

        $this->execute($params);
<?php else: ?>
<?php endif ?>
    }
}
