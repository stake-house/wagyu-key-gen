import click
from typing import (
    Any,
    Callable,
    Optional,
    Sequence,
    Tuple,
    Union,
)

from ethstaker_deposit.exceptions import ValidationError
from ethstaker_deposit.utils import config
# To work around an issue with disabling language prompt and CLIRunner() isolation
from ethstaker_deposit.utils.constants import INTL_LANG_OPTIONS
from ethstaker_deposit.utils.intl import (
    get_first_options,
)


def _value_of(f: Union[Callable[[], Any], Any]) -> Any:
    '''
    If the input, f, is a function, return f(), else return f.
    '''
    return (f() if callable(f) else f)


class JITOption(click.Option):
    '''
    A click.Option, except certain values are recomputed before they are used.
    '''
    def __init__(
        self,
        param_decls: Union[str, Sequence[str]],
        default: Union[Callable[[], Any], None, Any] = None,
        help: Union[Callable[[], str], str, None] = None,
        prompt: Union[Callable[[], str], str, None] = None,
        **kwargs: Any,
    ):

        self.callable_default = default
        self.callable_help = help
        self.callable_prompt = prompt

        # `click.Option.Argument.param_decls` takes a list of flags or argument names.
        if isinstance(param_decls, str):
            param_decls = [_value_of(param_decls)]

        super().__init__(
            param_decls=param_decls,
            default=_value_of(default),
            help=_value_of(help),
            prompt=_value_of(prompt),
            **kwargs,
        )

    def prompt_for_value(self, ctx: click.Context) -> Any:
        self.prompt = _value_of(self.callable_prompt)
        return super().prompt_for_value(ctx)

    def get_help_record(self, ctx: click.Context) -> Tuple[str, str]:
        self.help = _value_of(self.callable_help)
        return super().get_help_record(ctx)

    def get_default(self, ctx: click.Context, call: bool = True) -> Any:
        self.default = _value_of(self.callable_default)
        return super().get_default(ctx, call)


def jit_option(*args: Any, **kwargs: Any) -> Callable[[Any], Any]:
    """Attaches an option to the command.  All positional arguments are
    passed as parameter declarations to :class:`Option`; all keyword
    arguments are forwarded unchanged (except ``cls``).
    This is equivalent to creating an :class:`Option` instance manually
    and attaching it to the :attr:`Command.params` list.

    :param cls: the option class to instantiate.  This defaults to
                :class:`Option`.
    """

    def decorator(f: Callable[[Any], Any]) -> Callable[[Any], Any]:
        click.decorators._param_memo(f, JITOption(*args, **kwargs))
        return f

    return decorator


def prompt_if_none(ctx: click.Context, param: Any, user_input: str) -> bool:
    '''
    Returns true if the param prompt is none. To be used with the prompt_if argument from captive_prompt_callback.
    '''

    return param.prompt is None


def prompt_if_other_is_none(other: str) -> Callable[[click.Context, Any, str], bool]:
    '''
    Returns true if the other param is none. To be used with the prompt_if argument from captive_prompt_callback.
    '''

    def callback(ctx: click.Context, param: Any, user_input: str) -> bool:
        return ctx.params.get(other, None) is None

    return callback


def prompt_if_other_exists(other: str) -> Callable[[click.Context, Any, str], bool]:
    '''
    Returns true if the other param exists. To be used with the prompt_if argument from captive_prompt_callback.
    '''

    def callback(ctx: click.Context, param: Any, user_input: str) -> bool:
        return ctx.params.get(other, None) is not None

    return callback


def prompt_if_other_value(other: str, value: Any) -> Callable[[click.Context, Any, str], bool]:
    '''
    Returns true if the other param's value equal the passed value. To be used with the prompt_if argument
    from captive_prompt_callback.
    '''

    def callback(ctx: click.Context, param: Any, user_input: str) -> bool:
        return ctx.params.get(other, None) == value

    return callback


def captive_prompt_callback(
    processing_func: Callable[[str], Any],
    prompt: Callable[[], str],
    confirmation_prompt: Optional[Callable[[], str]] = None,
    confirmation_mismatch_msg: Callable[[], str] = lambda: '',
    hide_input: bool = False,
    default: Optional[Union[Callable[[], str], str]] = None,
    prompt_if: Optional[Callable[[click.Context, Any, str], bool]] = None,
) -> Callable[[click.Context, str, str], Any]:
    '''
    Traps the user in a prompt until the value chosen is acceptable
    as defined by `processing_func` not returning a ValidationError
    :param processing_func: A function to process the user's input that possibly raises a ValidationError
    :param prompt: the text to prompt the user with, should their input raise an error when passed to processing_func()
    :param confirmation_prompt: the optional prompt for confirming user input (the user must repeat their input)
    :param confirmation_mismatch_msg: the message displayed to the user should their input and confirmation not match
    :param hide_input: bool, hides the input as the user types
    :param default: the optional callable that returns a str or a str to be used as the default value if nothing is
    entered by the user
    :param prompt_if: the optional callable, prompt if the source of the parameter is from the default value and this
    call returns true
    '''
    def callback(ctx: click.Context, param: Any, user_input: str) -> Any:
        # the callback is called twice, once for the option prompt and once to verify the input
        # To avoid showing confirmation prompt twice, we introduce a flag to prompt inside
        # the callback
        # See https://github.com/pallets/click/discussions/2673
        if (prompt_if is not None
                and ctx.get_parameter_source(param.name) == click.core.ParameterSource.DEFAULT
                and prompt_if(ctx, param, user_input)):
            user_input = click.prompt(prompt(), hide_input=hide_input, default=_value_of(default))
        if config.non_interactive:
            return processing_func(user_input)
        while True:
            try:
                processed_input = processing_func(user_input)
                # Logic for confirming user input:
                if confirmation_prompt is not None and processed_input not in ('', None):
                    confirmation_input = click.prompt(confirmation_prompt(), hide_input=hide_input)
                    if processing_func(confirmation_input) != processed_input:
                        raise ValidationError(confirmation_mismatch_msg())
                return processed_input
            except ValidationError as e:
                click.echo('\n[Error] ' + str(e))
                user_input = click.prompt(prompt(), hide_input=hide_input, default=_value_of(default))
    return callback


def choice_prompt_func(prompt_func: Callable[[], str],
                       choices: Sequence[str],
                       add_colon: bool = True) -> Callable[[], str]:
    '''
    Formats the prompt and choices in a printable manner.
    '''
    # A join with unconditional embedded LTR can add non-printing characters on some Terminals
    # Iterate over choices instead and use LTR embedding if the string has RTL embedding
    output = '['
    for i in range(len(choices)):
        output = output + choices[i]
        if i < len(choices) - 1:
            if '\u202b' in choices[i]:
                output = output + '\u202a \u202c, '
            else:
                output = output + ', '
    output = output + ']'
    return lambda: '%s %s%s' % (prompt_func(), output, ': ' if add_colon else '')


def deactivate_prompts_callback(param_names: list[str]) -> Callable[[click.Context, str, str], Any]:
    def callback(ctx: click.Context, param: Any, value: str) -> Any:
        if value:
            for p in ctx.command.params:
                if isinstance(p, click.Option) and p.name in param_names and p.prompt is not None:
                    p.prompt = None
        else:  # CLIRunner() is not as isolated as it should be. Restore the language prompt during tests
            for p in ctx.command.params:
                if isinstance(p, click.Option) and p.prompt is None:
                    if p.name == 'language':
                        p.prompt = choice_prompt_func(lambda: 'Please choose your language',
                                                      get_first_options(INTL_LANG_OPTIONS))()
        return value
    return callback
