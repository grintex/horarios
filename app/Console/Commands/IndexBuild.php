<?php

namespace App\Console\Commands;

use App\Utils\Sanitizer;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class IndexBuild extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'index:build';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Rebuilds indexes related to dados-uffs and uffs-personnel';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $personnel = $this->findPersonnel();
        $this->createProfessorsIndexedContent($personnel);
        $this->createCoursesIndexedContent($personnel);

        $this->info('All complete!');

        return 0;
    }

    protected function findPersonnel() {
        $pdo = DB::connection('uffs-personnel')->getPdo();
        $stmt = $pdo->query("SELECT * FROM personnel");
        $personnel = [];

        while ($row = $stmt->fetch(\PDO::FETCH_OBJ)) {
            $personnel[] = $row;
        }

        return $personnel;
    }

    protected function createProfessorsIndexedContent(array $personnel) {
        $pdo = DB::connection('index')->getPdo();

        $this->comment('Creating table: professors');

        $pdo->beginTransaction();
        $pdo->exec('DROP TABLE IF EXISTS professors');
        $pdo->exec('CREATE TABLE professors (
            id INTEGER PRIMARY KEY,
            "name" TEXT,
            "job" TEXT,
            "email" TEXT,
            "uid" TEXT,
            "department_id" INTEGER,
            "department_name" TEXT,
            "department_initials" TEXT,
            "department_address" TEXT,
            "indexed_content" TEXT
        )');

        $this->line(' Adding indexed content');

        $bar = $this->output->createProgressBar(count($personnel));
        $bar->start();

        foreach($personnel as $person) {
            $qry = $pdo->prepare("INSERT INTO professors
                    (id, name, job, email, uid, department_id, department_name, department_initials, department_address, indexed_content) VALUES
                    (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ? )");

            $indexed_content = $person->name . ' ' . Sanitizer::clean($person->name) . ' ' . $person->uid;

            $qry->execute([
                $person->name,
                $person->job,
                $person->email,
                $person->uid,
                $person->department_id,
                $person->department_name,
                $person->department_initials,
                $person->department_address,
                $indexed_content
            ]);

            $bar->advance();
        }
        $bar->finish();

        $this->newLine();
        $this->line(' Creating index for improved performance');

        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_professors_indexed_content ON professors(indexed_content)");
        $pdo->commit();
    }

    protected function createCoursesIndexedContent()
    {
        $pdo = DB::connection('dados-uffs')->getPdo();

        $this->comment('Creating table: courses');

        $pdo->beginTransaction();
        $pdo->exec('DROP TABLE IF EXISTS courses');
        $pdo->exec('CREATE TABLE courses (
            id INTEGER PRIMARY KEY,
            "_id" TEXT,
            "cod_ccr" TEXT,
            "nome_ccr" TEXT,
            "cr_ccr" INTEGER,
            "ch_ccr" INTEGER,
            "desc_matriz" TEXT,
            "fase_oferta" INTEGER,
            "ccr_obrigatorio" TEXT,
            "ccr_optativo" TEXT,
            "nome_campus" TEXT,
            "cod_uffs" INTEGER,
            "cod_emec" INTEGER,
            "nome_curso" TEXT,
            "turno" TEXT,
            "per_ingresso" TEXT,
            "em_andamento" TEXT,
            "data_atualizacao" TEXT,
            "indexed_content"	TEXT
        )');
        $pdo->exec("INSERT INTO courses SELECT NULL, *, ' ' FROM 'graduacao_ccrs_matrizes/graduacao_ccrs_matrizes' GROUP BY cod_ccr");

        $this->line(' Adding indexed content');
       
        $stmt = $pdo->query("SELECT COUNT(*) FROM courses");
        $count = $stmt->fetch()[0];

        $bar = $this->output->createProgressBar($count);
        $bar->start();
        
        $stmt = $pdo->query("SELECT * FROM courses");
        
        while ($row = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $case_indexed_content = '';
            $case_indexed_content .= $row['nome_curso'] . ' ';
            $case_indexed_content .= $row['cod_ccr'] . ' ';
            $case_indexed_content .= $row['nome_ccr'] . ' ';
            
            // Repeat all content again with no accents and in lower case
            $lowercase_indexed_content = strtolower(Sanitizer::removeAccents($case_indexed_content));
            
            $indexed_content = $lowercase_indexed_content . ' ' . $case_indexed_content;

            $qry = $pdo->prepare("UPDATE courses SET indexed_content = ? WHERE id = ?");
            $qry->execute([$indexed_content, $row['id']]);

            $bar->advance();
        }
        $bar->finish();

        $this->newLine();
        $this->line(' Creating index for improved performance');

        $pdo->exec("CREATE INDEX IF NOT EXISTS idx_graduacao_historico_indexed_content ON idx_graduacao_historico(indexed_content)");
        $pdo->commit();
    }
}
