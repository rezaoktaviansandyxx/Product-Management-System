<?php

namespace App\Traits;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait Auditable
{
    public static function bootAuditable()
    {
        static::created(function ($model) {
            self::audit('CREATE', $model);
        });

        static::updated(function ($model) {
            self::audit('UPDATE', $model);
        });

        static::deleted(function ($model) {
            self::audit('DELETE', $model);
        });

        if (method_exists(__CLASS__, 'restored')) {
            static::restored(function ($model) {
                self::audit('RESTORE', $model);
            });
        }
    }

    protected static function audit($event, $model)
    {
        AuditLog::create([
            'event' => $event,
            'table_name' => $model->getTable(),
            'record_id' => $model->getKey(),
            'old_values' => $event === 'UPDATE' ? $model->getOriginal() : null,
            'new_values' => $event !== 'DELETE' ? $model->getAttributes() : null,
            'user_id' => Auth::check() ? Auth::id() : null,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent()
        ]);
    }
}