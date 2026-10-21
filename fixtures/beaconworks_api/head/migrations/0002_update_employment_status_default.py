from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('beaconworks', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='employee',
            name='employment_status',
            field=models.CharField(
                choices=[('probation', 'Probationary'), ('active', 'Active Regular'), ('terminated', 'Terminated')],
                default='active',
                max_length=20,
            ),
        ),
    ]
