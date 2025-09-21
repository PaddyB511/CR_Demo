from typing import List

from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


class ModelBase(models.Model):
    created_at = models.DateTimeField(_("Created Time"), auto_now_add=True, editable=False, blank=True, null=True)
    updated_at = models.DateTimeField(
        _("Last Modified Time"), editable=False, blank=True, null=True, default=timezone.now
    )

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        update_last_modified = kwargs.pop("update_last_modified", True)

        if update_last_modified:
            self.updated_at = timezone.now()

        return super(ModelBase, self).save(*args, **kwargs)

    def to_dict(self, fields: List[str] = None):
        model_dict = {}
        if not fields:
            fields = [field.get_attname_column() for field in self._meta.fields]
            model_dict = {field[1]: getattr(self, field[0]) for field in fields}
        else:
            for field in fields:
                model_dict[field] = getattr(self, field)
        return model_dict
