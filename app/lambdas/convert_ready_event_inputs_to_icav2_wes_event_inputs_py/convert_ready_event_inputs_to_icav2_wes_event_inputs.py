#!/usr/bin/env python3

"""
Given the inputs from a ready event, this script generates an ICAV2 WES event for the sash workflow.

The data payload inputs should look like the following:
{
    "mode": "wgts",
    "groupId": "SBJ05828",
    "subjectId": "SBJ05828",
    "tumorDnaSampleId" "TUMOR_LIBRARY_ID",
    "normalDnaSampleId": "NORMAL_LIBRARY_ID",
    "dragenSomaticDir": "s3://path-to-tumor-dir/",
    "dragenGermlineDir": "s3://path-to-normal-dir/",
    "oncoanalyserDnaDir": "s3://path-to-oncoanalyser-dna-dir/",
    "refDataPath": "s3://path-to-reference-data/sash/sash-ref-data/",
}


To generate an output like the following

{
  "inputs": {
        "monochrome_logs": True,
        "mode": "wgts",
        "samplesheet": [
            # Tumor Somatic dir
            {
                "id": ".groupId",
                "subject_name": ".subjectId",
                "sample_name": ".tumorDnaSampleId",
                "filetype": "dragen_somatic_dir",
                "filepath": "s3://path/to/dragen_somatic_dir/",
            },
            # Normal Germline Dir
            {
                "id": ".groupId",
                "subject_name": ".subjectId",
                "sample_name": ".normalDnaSampleId",
                "filetype": "dragen_germline_dir",
                "filepath": "s3://path/to/dragen_germline_dir/",
            },
            # Oncoanalyser DNA Dir
            {
                "id": ".groupId",
                "subject_name": ".subjectId",
                "sample_name": ".tumorDnaSampleId",
                "filetype": "oncoanalyser_dir",
                "filepath": "s3://path/to/oncoanalyser_dir/",
            },
        ]
        "ref_data_path": "s3://path-to-reference-data/oncoanalyser/hmf-reference-data/hmftools/hmf_pipeline_resources.38_v2.1.0--1/"
    }
}
"""

# Typing imports
from typing import List, Dict, Union, cast
import pandas as pd

# Globals
DEFAULT_MODE = "wgts"
DEFAULT_MONOCHROME_LOGS = True

DEFAULT_SAMPLESHEET_COLUMNS = [
    "id",
    "subject_name",
    "sample_name",
    "filetype",
    "filepath",
]


def generate_samplesheet_from_inputs(ready_event_inputs: Dict[str, Union[str, Dict[str, str]]]) -> List[Dict[str, str]]:
    samplesheet_df = pd.DataFrame(
        columns=DEFAULT_SAMPLESHEET_COLUMNS,
        data=[
            # Dragen somatic dir
            {
                "id": ready_event_inputs["groupId"],
                "subject_name": ready_event_inputs["subjectId"],
                "sample_name": ready_event_inputs["tumorDnaSampleId"],
                "filetype": "dragen_somatic_dir",
                "filepath": ready_event_inputs["dragenSomaticDir"],
            },
            # Dragen germline dir
            {
                "id": ready_event_inputs["groupId"],
                "subject_name": ready_event_inputs["subjectId"],
                "sample_name": ready_event_inputs["normalDnaSampleId"],
                "filetype": "dragen_germline_dir",
                "filepath": ready_event_inputs["dragenGermlineDir"],
            },
            # Oncoanalyser DNA dir
            {
                "id": ready_event_inputs["groupId"],
                "subject_name": ready_event_inputs["subjectId"],
                "sample_name": ready_event_inputs["tumorDnaSampleId"],
                "filetype": "oncoanalyser_dir",
                "filepath": ready_event_inputs["oncoanalyserDnaDir"],
            }
        ]
    )

    # Convert the DataFrame to a list of dictionaries
    return cast(List[Dict[str, str]], samplesheet_df.to_dict(orient='records'))


def genome_keys_to_snake_case(genome: Dict[str, str]) -> Dict[str, str]:
    """
    Input genome keys are in camelCase, this function converts them to snake_case.
    :param genome:
    :return:
    """
    return dict(map(
        lambda kv_iter_: (kv_iter_[0].replace("Index", "_index").lower(), kv_iter_[1]),
        genome.items()
    ))


def handler(event, context):
    """
    Given the inputs from a ready event, this script generates an ICAV2 WES event inputs for the oncoanalyser workflow.
    :param event:
    :param context:
    :return:
    """

    # Get the ready event inputs
    ready_event_inputs: Dict[str, Union[str, Dict[str, str]]] = event.get("inputs", {})

    # Extract necessary fields from the ready event inputs
    return {
        "inputs": dict(filter(
            lambda kv_iter_: kv_iter_[1] is not None,
            {
                "monochrome_logs": ready_event_inputs.get("monochromeLogs", DEFAULT_MONOCHROME_LOGS),
                "samplesheet": generate_samplesheet_from_inputs(ready_event_inputs),
                "ref_data_path": ready_event_inputs["refDataPath"],
            }.items()
        ))
    }


# if __name__ == "__main__":
#     import json
#
#     print(json.dumps(
#         handler(
#             {
#                 "inputs": {
#                     "mode": "wgts",
#                     "groupId": "SBJ05828",
#                     "subjectId": "SBJ05828",
#                     "tumorDnaBamUri": "s3://path-to-tumor-bam",
#                     "normalDnaBamUri": "s3://path-to-normal-bam",
#                     "tumorDnaSampleId": "TUMOR_LIBRARY_ID",
#                     "normalDnaSampleId": "NORMAL_LIBRARY_ID",
#                     "genome": "GRCh38_umccr",
#                     "genomeVersion": "38",
#                     "genomeType": "alt",
#                     "forceGenome": True,
#                     "refDataHmfDataPath": "s3://path-to-reference-data/oncoanalyser/hmf-reference-data/hmftools/hmf_pipeline_resources.38_v2.1.0--1/",
#                     "genomes": {
#                         "GRCh38_umccr": {
#                             "fasta": "s3://path-to-reference-data/oncoanalyser/GRCh38_umccr/GRCh38_full_analysis_set_plus_decoy_hla.fa",
#                             "fai": "s3://path-to-reference-data/oncoanalyser/GRCh38_umccr/samtools_index/1.16/GRCh38_full_analysis_set_plus_decoy_hla.fa.fai",
#                             "dict": "s3://path-to-reference-data/oncoanalyser/GRCh38_umccr/samtools_index/1.16/GRCh38_full_analysis_set_plus_decoy_hla.fa.dict",
#                             "img": "s3://path-to-reference-data/oncoanalyser/GRCh38_umccr/bwa_index_image/0.7.17-r1188/GRCh38_full_analysis_set_plus_decoy_hla.fa.img",
#                             "bwamem2Index": "s3://path-to-reference-data/oncoanalyser/GRCh38_umccr/bwa-mem2_index/2.2.1/",
#                             "gridssIndex": "s3://path-to-reference-data/oncoanalyser/GRCh38_umccr/gridss_index/2.13.2/",
#                             "starIndex": "s3://path-to-reference-data/oncoanalyser/GRCh38_umccr/star_index/gencode_38/2.7.3a/"
#                         }
#                     }
#                 }
#             },
#             None
#         ),
#         indent=4
#     ))
#
# # {
# #     "inputs": {
# #         "mode": "wgts",
# #         "samplesheet": [
# #             {
# #                 "group_id": "SBJ05828",
# #                 "subject_id": "SBJ05828",
# #                 "sample_id": "NORMAL_LIBRARY_ID",
# #                 "sample_type": "normal",
# #                 "sequence_type": "dna",
# #                 "filetype": "bam",
# #                 "filepath": "s3://path-to-normal-bam"
# #             },
# #             {
# #                 "group_id": "SBJ05828",
# #                 "subject_id": "SBJ05828",
# #                 "sample_id": "TUMOR_LIBRARY_ID",
# #                 "sample_type": "tumor",
# #                 "sequence_type": "dna",
# #                 "filetype": "bam",
# #                 "filepath": "s3://path-to-tumor-bam"
# #             },
# #             {
# #                 "group_id": "SBJ05828",
# #                 "subject_id": "SBJ05828",
# #                 "sample_id": "NORMAL_LIBRARY_ID",
# #                 "sample_type": "normal",
# #                 "sequence_type": "dna",
# #                 "filetype": "bai",
# #                 "filepath": "s3://path-to-normal-bam.bai"
# #             },
# #             {
# #                 "group_id": "SBJ05828",
# #                 "subject_id": "SBJ05828",
# #                 "sample_id": "TUMOR_LIBRARY_ID",
# #                 "sample_type": "tumor",
# #                 "sequence_type": "dna",
# #                 "filetype": "bai",
# #                 "filepath": "s3://path-to-tumor-bam.bai"
# #             }
# #         ],
# #         "genome": "GRCh38_umccr",
# #         "genome_version": "38",
# #         "genome_type": "alt",
# #         "force_genome": true,
# #         "ref_data_hmf_data_path": "s3://path-to-reference-data/oncoanalyser/hmf-reference-data/hmftools/hmf_pipeline_resources.38_v2.1.0--1/",
# #         "genomes": {
# #             "GRCh38_umccr": {
# #                 "fasta": "s3://path-to-reference-data/oncoanalyser/GRCh38_umccr/GRCh38_full_analysis_set_plus_decoy_hla.fa",
# #                 "fai": "s3://path-to-reference-data/oncoanalyser/GRCh38_umccr/samtools_index/1.16/GRCh38_full_analysis_set_plus_decoy_hla.fa.fai",
# #                 "dict": "s3://path-to-reference-data/oncoanalyser/GRCh38_umccr/samtools_index/1.16/GRCh38_full_analysis_set_plus_decoy_hla.fa.dict",
# #                 "img": "s3://path-to-reference-data/oncoanalyser/GRCh38_umccr/bwa_index_image/0.7.17-r1188/GRCh38_full_analysis_set_plus_decoy_hla.fa.img",
# #                 "bwamem2_index": "s3://path-to-reference-data/oncoanalyser/GRCh38_umccr/bwa-mem2_index/2.2.1/",
# #                 "gridss_index": "s3://path-to-reference-data/oncoanalyser/GRCh38_umccr/gridss_index/2.13.2/",
# #                 "star_index": "s3://path-to-reference-data/oncoanalyser/GRCh38_umccr/star_index/gencode_38/2.7.3a/"
# #             }
# #         }
# #     }
# # }
